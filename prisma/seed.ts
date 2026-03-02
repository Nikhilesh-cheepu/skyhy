import { PrismaClient } from '@prisma/client';
import { menuData } from '../src/lib/menu-data';

type SectionSlug = keyof typeof menuData;
type Item = { id: number; name: string; description: string; price: number; category: string };
type CategoryItems = Item[];

const SECTION_NAMES: Record<SectionSlug, string> = {
  food: 'Food',
  beverage: 'Beverage',
  liquor: 'Liquor',
  store: 'Store',
  'special-128': 'Special ₹128',
};

const prisma = new PrismaClient();

async function main() {
  // Delete in reverse dependency order to satisfy FKs
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.section.deleteMany({});

  const sectionSlugs = Object.keys(menuData) as SectionSlug[];
  const sectionIdBySlug = new Map<string, string>();
  const categoryIdByKey = new Map<string, string>(); // key: `${sectionId}:${categorySlug}`

  // Create sections
  for (let i = 0; i < sectionSlugs.length; i++) {
    const slug = sectionSlugs[i];
    const name = SECTION_NAMES[slug] ?? slug;
    const section = await prisma.section.create({
      data: { slug, name, sortOrder: i },
    });
    sectionIdBySlug.set(slug, section.id);
  }

  // Create categories and menu items per section
  const allItemIds = new Set<number>();
  for (const sectionSlug of sectionSlugs) {
    const sectionId = sectionIdBySlug.get(sectionSlug)!;
    const categories = menuData[sectionSlug] as Record<string, CategoryItems>;
    const categoryKeys = Object.keys(categories);

    for (let c = 0; c < categoryKeys.length; c++) {
      const categorySlug = categoryKeys[c];
      const cat = await prisma.category.create({
        data: {
          sectionId,
          slug: categorySlug,
          name: categorySlug.replace(/-/g, ' '),
          sortOrder: c,
        },
      });
      categoryIdByKey.set(`${sectionId}:${categorySlug}`, cat.id);

      const items = categories[categorySlug];
      for (let s = 0; s < items.length; s++) {
        const it = items[s];
        if (allItemIds.has(it.id)) {
          throw new Error(`Duplicate menu item id: ${it.id}`);
        }
        allItemIds.add(it.id);
        await prisma.menuItem.create({
          data: {
            id: it.id,
            name: it.name,
            description: it.description,
            price: it.price,
            category: it.category,
            sectionId,
            categoryId: cat.id,
            sortOrder: s,
            isActive: true,
          },
        });
      }
    }
  }

  // Confirm counts
  const [sectionsCount, categoriesCount, menuItemsCount] = await Promise.all([
    prisma.section.count(),
    prisma.category.count(),
    prisma.menuItem.count(),
  ]);

  console.log('Seed completed.');
  console.log('Sections:', sectionsCount);
  console.log('Categories:', categoriesCount);
  console.log('Menu items:', menuItemsCount);
  console.log('Unique item IDs:', allItemIds.size);
  if (menuItemsCount !== allItemIds.size) {
    throw new Error('Menu item count mismatch');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
