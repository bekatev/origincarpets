/** Google Search Console ownership verification (HTML file method). */
export function GET() {
  return new Response('google-site-verification: google55877845b1120bb9.html\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
