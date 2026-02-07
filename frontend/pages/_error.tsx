import { NextPageContext } from "next";
import { useRouter } from "next/router";
import Button from "../components/ui/Button";

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
      <div className="text-center bg-white rounded-lg shadow-md p-6 md:p-10 max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {statusCode || "Erreur"}
        </h1>
        <p className="text-gray-500 mb-6">
          {statusCode === 404
            ? "La page que vous recherchez n'existe pas."
            : "Une erreur s'est produite."}
        </p>

        <Button onClick={() => router.push("/")} className="px-6 py-3">
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
