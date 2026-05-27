export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const API_ORIGIN = API_URL.replace(/\/api$/, '');

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

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function throwApiError(payload: unknown): never {
  const maybeObject = payload as { message?: string | string[] } | null;
  const message = maybeObject?.message;
  throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Request failed');
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throwApiError(payload);
  }

  return payload as T;
}

export async function apiRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`
    }
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throwApiError(payload);
  }

  return payload as T;
}

export async function uploadImage(file: File, token: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/uploads/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throwApiError(payload);
  }

  return payload as { url: string };
}
