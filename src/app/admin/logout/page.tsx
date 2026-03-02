import { redirect } from 'next/navigation';
import { clearAdminCookie } from '@/lib/admin-auth';

export default async function AdminLogoutPage() {
  await clearAdminCookie();
  redirect('/admin/login');
}

