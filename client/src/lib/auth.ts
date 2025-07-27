import { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'password'> {
  token: string;
}

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const setAuthUser = (user: AuthUser) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const getAuthUser = (): AuthUser | null => {
  const userData = localStorage.getItem('auth_user');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const removeAuthUser = () => {
  localStorage.removeItem('auth_user');
};

export const logout = () => {
  removeAuthToken();
  removeAuthUser();
};
