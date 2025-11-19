import fs from "fs";
import path from "path";

export const revalidate = 0; // ensure real-time behavior (no caching)

export async function GET() {
  try {
    // On Vercel, the root of the deployed bundle is process.cwd()
    // output.json ends up in the same top-level directory as static files
    const filePath = path.join(process.cwd(), "output.json");

    if (!fs.existsSync(filePath)) {
      return new Response("<h1>No event data file found.</h1>", {
        headers: { "content-type": "text/html" }
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const events = JSON.parse(raw);

    if (!Array.isArray(events)) {
      return new Response("<h1>Invalid event data format.</h1>", {
        headers: { "content-type": "text/html" }
      });
    }

    const now = new Date();

    // Filter → upcoming only
    const upcoming = events
      .filter(e => e.event_starts_at && new Date(e.event_starts_at) >= now)
      .sort((a, b) => new Date(a.event_starts_at) - new Date(b.event_starts_at));

    if (upcoming.length === 0) {
      return new Response("<h1>No upcoming events.</h1>", {
        headers: { "content-type": "text/html" }
      });
    }

    const firstStart = upcoming[0].event_starts_at;
    const sameStart = upcoming.filter(e => e.event_starts_at === firstStart);

    // If exactly ONE → redirect
    if (sameStart.length === 1) {
      const ev = sameStart[0];
      const target = ev.url || `/events/${ev.slug}/`;

      return Response.redirect(target, 302);
    }

    // If MULTIPLE → disambiguation page
    const htmlList = sameStart
      .map(e => {
        const link = e.url || `/events/${e.slug}/`;
        return `<li>
          <a href="${link}">${e.title}</a>
          <br><small>${e.event_starts_at}</small>
        </li>`;
      })
      .join("");

    const html = `
      <h1>Multiple Events Starting at the Same Time</h1>
      <ul>${htmlList}</ul>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html" }
    });

  } catch (err) {
    console.error(err);
    return new Response("<h1>Runtime error.</h1>", {
      headers: { "content-type": "text/html" }
    });
  }
}
