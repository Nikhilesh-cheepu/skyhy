import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | SHYHY Live — Rooftop • Bar • Live Bands',
  description: 'Feel the Sky, Live the Music. Experience the best rooftop bar with live bands, cocktails, and city skyline views.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 font-playfair">
          Welcome to SHYHY Live
        </h1>
        <p className="text-center text-lg text-muted-foreground mb-8">
          Feel the Sky, Live the Music
        </p>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Rooftop • Bar • Live Bands
          </p>
        </div>
      </div>
    </main>
  );
}
