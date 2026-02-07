import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ButtonSpinner } from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Identifiants incorrects');
      }

      const result = await response.json();
      await login(result.token);
      toast.success('Connexion réussie !');

      const redirect = (router.query.redirect as string) || '/dashboard';
      router.push(redirect);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue';
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-md p-5 md:p-8 max-w-md w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800 text-center">
          Connexion
        </h1>

        {apiError && <ErrorMessage message={apiError} className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: "L'email est requis",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Format d'email invalide",
              },
            })}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Le mot de passe est requis',
              minLength: {
                value: 6,
                message: 'Le mot de passe doit contenir au moins 6 caractères',
              },
            })}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 flex items-center justify-center"
          >
            {isSubmitting && <ButtonSpinner />}
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Pas de compte ?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
