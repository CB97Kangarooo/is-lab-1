import { request } from './client';

export interface AuthUser {
  username: string;
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>('GET', '/auth/me');
}

export function login(username: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('POST', '/auth/login', { body: { username, password } });
}

export function register(username: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('POST', '/auth/register', { body: { username, password } });
}

export function logout(): Promise<void> {
  return request<void>('POST', '/auth/logout');
}
