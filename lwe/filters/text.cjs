function splitLines(value, options = {}) {
  const trim = options.trim !== false;
  const skipEmpty = options.skipEmpty !== false;

  const source = Array.isArray(value) ? value.join("\n") : value;
  if (source === undefined || source === null) {
    return [];
  }

  return String(source)
    .split(/\r?\n/)
    .map((line) => (trim ? line.trim() : line))
    .filter((line) => !skipEmpty || line.length > 0);
}

function splitParagraphs(value, options = {}) {
  const trim = options.trim !== false;
  const skipEmpty = options.skipEmpty !== false;

  const source = Array.isArray(value) ? value.join("\n\n") : value;
  if (source === undefined || source === null) {
    return [];
  }

  return String(source)
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((paragraph) => (trim ? paragraph.trim() : paragraph))
    .filter((paragraph) => !skipEmpty || paragraph.length > 0);
}

function registerTextFilters(eleventyConfig) {
  eleventyConfig.addFilter("lines", splitLines);
  eleventyConfig.addFilter("paragraphs", splitParagraphs);
}

module.exports = {
  registerTextFilters,
  splitLines,
  splitParagraphs,
};
