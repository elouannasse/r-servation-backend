import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth = true) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token && requireAuth) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(!!token);
    setLoading(false);
  }, [requireAuth, router]);

  return { isAuthenticated, loading };
}
