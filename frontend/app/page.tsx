import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">Carpet Commerce</h1>
      <p className="mt-3 text-stone-700">Authentication scaffold is ready with JWT, roles, and protected backend routes.</p>

      <div className="mt-6 flex gap-3">
        <Link href="/login" className="rounded-md bg-brand-700 px-4 py-2 text-white">
          Login
        </Link>
        <Link href="/register" className="rounded-md border border-stone-300 px-4 py-2 text-stone-900">
          Register
        </Link>
      </div>
    </main>
  );
}
