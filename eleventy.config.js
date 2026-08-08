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

  // The year "now", Pacific — /lun/ uses it to pick which weeks render
  // inline; older years live under /lun/archive/.
  eleventyConfig.addGlobalData("currentYear", () =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
    }).format(new Date())
  );

  return {
    dir: {
      input: "content",
      output: "_site",
      includes: "../_includes",
    },
  };
}
