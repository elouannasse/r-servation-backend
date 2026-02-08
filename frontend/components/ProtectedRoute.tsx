'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'ADMIN' | 'PARTICIPANT';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      // Pas de token → rediriger
      if (!token) {
        router.push(redirectTo);
        return;
      }

      // Si un rôle spécifique est requis, vérifier
      if (requireRole) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) {
            router.push(redirectTo);
            return;
          }

          const user = await response.json();
          
          if (user.role !== requireRole) {
            // Rediriger selon le rôle
            if (user.role === 'ADMIN') {
              router.push('/admin/events');
            } else {
              router.push('/events');
            }
            return;
          }
        } catch (error) {
          router.push(redirectTo);
          return;
        }
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [requireRole, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
