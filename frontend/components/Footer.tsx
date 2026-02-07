import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Réservation</h3>
            <p className="text-sm">
              Découvrez et réservez vos événements facilement.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Navigation</h4>
            <div className="flex flex-col gap-1 text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <Link
                href="/events"
                className="hover:text-white transition-colors"
              >
                Événements
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Liens</h4>
            <div className="flex flex-col gap-1 text-sm">
              <span>À propos</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Réservation. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
