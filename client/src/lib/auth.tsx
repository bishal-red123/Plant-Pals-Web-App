import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from './queryClient';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { isLoading, error: queryError } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    staleTime: Infinity,
    queryFn: getQueryFn({ on401: 'returnNull' }) as any,
    onSuccess: (data: { user: User } | null) => {
      if (data?.user) {
        setUser(data.user);
      }
    },
    onError: () => {
      setUser(null);
    },
  });

  useEffect(() => {
    if (queryError) {
      setError(queryError as Error);
    }
  }, [queryError]);

  const login = (userData: User) => {
    setUser(userData);
    setError(null);
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Helper function for handling 401s
type UnauthorizedBehavior = "returnNull" | "throw";
const getQueryFn = ({ on401 }: { on401: UnauthorizedBehavior }) => {
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    try {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });

      if (on401 === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      if (on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
};