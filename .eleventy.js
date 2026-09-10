const fs = require("node:fs");
const path = require("node:path");
const markdownIt = require("markdown-it");
const { registerCalendarFilters } = require("./lwe/filters/calendar");
const { registerTextFilters } = require("./lwe/filters/text.cjs");

function stripEditorOnlyControls(content) {
  return content.replace(
    /<([a-z][\w:-]*)\b(?=[^>]*\bdata-lcb-only\b)[^>]*>[\s\S]*?<\/\1>/gi,
    ""
  );
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setFreezeReservedData(false);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ manual_images: "manual_images" });
  eleventyConfig.addWatchTarget("MANUAL.md");
  eleventyConfig.addWatchTarget("MANUAL.en.md");
  eleventyConfig.addWatchTarget("MANUAL.de.md");
  registerCalendarFilters(eleventyConfig);
  registerTextFilters(eleventyConfig);

  eleventyConfig.addTransform("strip-editor-only-controls", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }

    return stripEditorOnlyControls(content);
  });

  const markdown = markdownIt({
    html: false,
    linkify: true,
  });

  const manualSources = {
    nl: {
      file: "MANUAL.md",
      title: "LWE Manual",
      description: "Handleiding voor de Local Website Editor.",
    },
    en: {
      file: "MANUAL.en.md",
      title: "LWE Manual",
      description: "Manual for the Local Website Editor.",
    },
    de: {
      file: "MANUAL.de.md",
      title: "LWE Manual",
      description: "Handbuch fur den Local Website Editor.",
    },
  };

  eleventyConfig.addGlobalData("manualPages", () => {
    const fallbackPath = path.join(__dirname, manualSources.nl.file);
    const fallback = fs.readFileSync(fallbackPath, "utf8");

    return Object.fromEntries(
      Object.entries(manualSources).map(([lang, source]) => {
        const manualPath = path.join(__dirname, source.file);
        const markdownSource = fs.existsSync(manualPath)
          ? fs.readFileSync(manualPath, "utf8")
          : fallback;

        return [
          lang,
          {
            ...source,
            html: markdown.render(markdownSource),
          },
        ];
      })
    );
  });

  eleventyConfig.addFilter("t", function (value, lang) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return value[lang] || value.nl || "";
  });

  eleventyConfig.addFilter("manualPath", function (lang) {
    return lang === "nl" ? "/manual/" : `/manual/${lang}/`;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
