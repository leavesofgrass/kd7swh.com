import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // Filters for the hand-written feed templates: dateToRfc3339,
  // getNewestCollectionItemDate, absoluteUrl.
  eleventyConfig.addPlugin(pluginRss);

  // Passthrough paths are relative to the project root, not the input dir.
  eleventyConfig.addPassthroughCopy({ "css": "css" });

  // One entry per week, newest first.
  eleventyConfig.addCollection("lun", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/lun/*.md")
      .sort((a, b) => b.date - a.date)
  );

  // Prior years, newest first, for /lun/archive/. The current year renders
  // at /lun/ instead.
  eleventyConfig.addCollection("lunArchiveYears", (collectionApi) => {
    const current = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
    }).format(new Date());
    const byYear = new Map();
    for (const week of collectionApi
      .getFilteredByGlob("content/lun/*.md")
      .sort((a, b) => b.date - a.date)) {
      const year = week.date.toISOString().slice(0, 4);
      if (year === current) continue;
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year).push(week);
    }
    return [...byYear.entries()]
      .map(([year, items]) => ({ year, items }))
      .sort((a, b) => b.year.localeCompare(a.year));
  });

  // All date formatting happens in UTC. Week files carry date: YYYY-MM-DD,
  // which front matter parses as midnight UTC — formatting in any other zone
  // shifts every heading a day.
  eleventyConfig.addFilter("dateHeading", (d) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(d))
  );

  eleventyConfig.addFilter("year", (d) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
    }).format(new Date(d))
  );

  eleventyConfig.addFilter("isoDate", (d) =>
    new Date(d).toISOString().slice(0, 10)
  );

  eleventyConfig.addFilter("inYear", (weeks, year) =>
    (weeks || []).filter(
      (w) => w.date.toISOString().slice(0, 4) === String(year)
    )
  );

  // Project-page grouping for /projects/ — plain JS beats Nunjucks
  // set-inside-loop scoping games.
  eleventyConfig.addFilter("inGroup", (items, group) =>
    (items || []).filter((p) => p.data.group === group)
  );

  // The year "now", Pacific — /lun/ uses it to pick which weeks render
  // inline; older years live under /lun/archive/.
  eleventyConfig.addGlobalData("currentYear", () =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
    }).format(new Date())
  );

  // The one place the canonical origin lives. A successor rehosting the
  // archive changes this line and nothing else (see CONTRIBUTING.md).
  eleventyConfig.addGlobalData("siteUrl", "https://kd7swh.com");

  // Fallback timestamp so feeds stay valid before any week exists. A fixed
  // value, not build time — builds must be byte-identical locally and in CI.
  eleventyConfig.addGlobalData("siteEpoch", "2026-08-08T00:00:00Z");

  // Headlines are published verbatim, and real Linux headlines contain
  // template syntax ("Ansible's {{ lookup }}") and angle-bracket tokens
  // ("Option<T>"). Markdown must therefore be pure Markdown: no Liquid
  // preprocessing (a {% raw %}{% if %}{% endraw %} headline would abort
  // the Monday build), and no raw-HTML passthrough (a <T> would vanish).
  eleventyConfig.amendLibrary("md", (md) => md.set({ html: false }));

  return {
    dir: {
      input: "content",
      output: "_site",
      includes: "../_includes",
    },
    markdownTemplateEngine: false,
  };
}
