// Very small gate for the admin-only endpoints. The admin dashboard sends
// the key back as a header on every request; it's compared to the
// ADMIN_KEY environment variable set in Vercel. This replaces the implicit
// protection Google gave the /admin Apps Script page.
export function checkAdmin(req) {
  const key = req.headers['x-admin-key'];
  return Boolean(key) && key === process.env.ADMIN_KEY;
}
