import { next } from '@vercel/functions';

// Password gate for the design-concept preview. Runs on Vercel before any page or asset is served.
// The password lives in the SITE_PASSWORD environment variable, never in this file or the site bundle.
export default function proxy(request: Request) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return new Response('This preview is not configured.', { status: 503 });

  const header = request.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const given = decoded.slice(decoded.indexOf(':') + 1);
      // compare every character so timing does not leak how much matched
      let diff = given.length ^ expected.length;
      for (let i = 0; i < Math.max(given.length, expected.length); i++) diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
      if (diff === 0) return next();
    } catch {
      /* fall through to the prompt */
    }
  }
  return new Response('Password required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Y TREE design concept", charset="UTF-8"', 'Cache-Control': 'no-store' },
  });
}
