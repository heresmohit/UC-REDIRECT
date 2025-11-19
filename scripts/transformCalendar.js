// scripts/transformCalendar.js

export async function transformCalendar(rawData) {

  // Normalize to UTC ISO
  function toUtcIso(timestr) {
    if (!timestr) return null;
    const d = new Date(timestr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  const events = [];

  for (const topic of rawData.topic_list.topics) {
    const topic_id = topic.id;
    const slug = topic.slug;

    // Fetch detailed topic JSON
    const detail_url = `https://underline.center/t/${slug}/${topic_id}.json`;
    const detail = await (await fetch(detail_url)).json();
    const first_post = detail.post_stream?.posts?.[0];

    events.push({
      id: topic_id,
      slug,
      title: topic.title,
      fancy_title: topic.fancy_title,
      excerpt: topic.excerpt,
      full_content: first_post?.raw || "",
      image_url: topic.image_url,
      thumbnails: topic.thumbnails || [],
      featured_link: topic.featured_link || null,

      event_starts_at: toUtcIso(topic.event_starts_at),
      event_ends_at: toUtcIso(topic.event_ends_at),

      // Optional: stable event page URL in your site
      url: `/events/${slug}/`
    });
  }

  return events;
}
