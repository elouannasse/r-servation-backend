import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 text-center">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        Bienvenue sur Reservation App
      </h1>
      <p className="text-sm md:text-base lg:text-lg text-gray-500 mb-8 max-w-2xl">
        Découvrez et réservez vos événements en toute simplicité.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/events"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm md:text-base font-semibold transition-colors text-center"
        >
          Parcourir les événements
        </Link>
        <Link
          href="/profile"
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg text-sm md:text-base font-medium transition-colors text-center"
        >
          Voir mon profil
        </Link>
      </div>
    </div>
  );
}
