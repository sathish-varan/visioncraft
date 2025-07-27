import { useState, useEffect } from "react";
import { AuthUser, getAuthUser, getAuthToken, setAuthUser, setAuthToken, logout as authLogout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getAuthUser();
    const token = getAuthToken();
    
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();
      
      const authUser: AuthUser = { ...data.user, token: data.token };
      setUser(authUser);
      setAuthUser(authUser);
      setAuthToken(data.token);
      
      return authUser;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { username: string; email: string; password: string; role: string; city: string }) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      const authUser: AuthUser = { ...data.user, token: data.token };
      setUser(authUser);
      setAuthUser(authUser);
      setAuthToken(data.token);
      
      return authUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    authLogout();
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
