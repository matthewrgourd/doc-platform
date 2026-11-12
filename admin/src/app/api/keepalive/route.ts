// Free Supabase projects pause after 7 days without activity, which breaks
// sign-in to this dashboard. Vercel Cron calls this daily (admin/vercel.json)
// and it reads one row, so the request reaches Postgres. Unlike the GitHub
// workflow, a Vercel cron keeps running when the repo has no commits.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/keepalive?select=id&limit=1`,
    {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    return new Response(`Supabase returned ${res.status}`, { status: 502 });
  }
  return new Response("ok");
}
