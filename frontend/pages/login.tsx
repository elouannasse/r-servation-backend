import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { ButtonSpinner } from "../components/Loader";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Identifiants incorrects");
      }

      const data = await response.json();
      await login(data.token);
      toast.success("Connexion réussie !");
      router.push("/profile");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Connexion
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 flex items-center justify-center"
          >
            {loading && <ButtonSpinner />}
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Pas encore de compte ? Contactez l&apos;administrateur
        </p>
      </div>
    </div>
  );
}
