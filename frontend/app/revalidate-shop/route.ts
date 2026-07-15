import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * NOTE: Must NOT live under `/api/*` — nginx proxies `/api/` to Nest.
 * Admin UI calls this after product create/update/publish.
 */
async function authorize(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return false;

  const apiBase =
    process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api';

  try {
    const response = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: header },
      cache: 'no-store'
    });
    if (!response.ok) return false;
    const user = (await response.json()) as { role?: string };
    return user.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('products', 'max');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/products', 'layout');

  return NextResponse.json({ revalidated: true, at: Date.now() });
}
