(() => {
  const list = document.querySelector("#news-list");
  if (!list) return;

  const FEEDS = [
    { name: "USBGF", url: "https://usbgf.org/feed/" },
    { name: "The Gammon Press", url: "https://thegammonpress.com/feed/" },
  ];
  const LIMIT = 8;

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const stripHtml = (value) =>
    String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const safeLink = (value) => {
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch {
      /* ignore */
    }
    return "";
  };

  const render = (stories) => {
    if (!stories.length) {
      list.innerHTML = `<p class="empty">Nothing came through just now. Try <a href="https://usbgf.org/usbgf-news/">USBGF News</a> or <a href="https://thegammonpress.com/">The Gammon Press</a> directly.</p>`;
      return;
    }

    list.innerHTML = stories
      .map((story) => {
        const href = escapeHtml(story.link);
        return `<article class="news-card">
          <p class="kicker">${escapeHtml(story.source)}${story.date ? ` · ${escapeHtml(story.date)}` : ""}</p>
          <h3><a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(story.title)}</a></h3>
          ${story.summary ? `<p>${escapeHtml(story.summary)}</p>` : ""}
        </article>`;
      })
      .join("");
  };

  const loadFeed = async (feed) => {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("feed failed");
    const payload = await response.json();
    if (payload.status !== "ok" || !Array.isArray(payload.items)) throw new Error("bad feed");

    return payload.items.map((item) => ({
      title: stripHtml(item.title || "Untitled"),
      link: safeLink(item.link),
      date: formatDate(item.pubDate),
      stamp: Date.parse(item.pubDate) || 0,
      source: feed.name,
      summary: (() => {
        const text = stripHtml(item.description);
        return text.length > 180 ? `${text.slice(0, 177).trim()}…` : text;
      })(),
    })).filter((item) => item.link);
  };

  Promise.allSettled(FEEDS.map(loadFeed)).then((results) => {
    const stories = results
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .sort((a, b) => b.stamp - a.stamp)
      .slice(0, LIMIT);
    render(stories);
  });
})();
