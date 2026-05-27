export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  firstName: string | null;
  lastName: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Request failed');
  }

  return payload as T;
}
