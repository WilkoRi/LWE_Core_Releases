function parseLocalDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function localToday(now = new Date()) {
  const date = now instanceof Date ? now : parseLocalDate(now);
  if (!date || Number.isNaN(date.getTime())) {
    return localToday(new Date());
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eventLastDate(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  return (
    event.showUntil ||
    event.endDate ||
    event.end ||
    event.eindDatum ||
    event.startDate ||
    event.start ||
    event.datum ||
    event.date ||
    null
  );
}

function isUpcomingEvent(event, options = {}) {
  if (!event || typeof event !== "object") {
    return false;
  }

  if (event.hidden === true || event.visible === false) {
    return false;
  }

  const lastDate = parseLocalDate(eventLastDate(event));
  if (!lastDate) {
    return true;
  }

  const hideFrom = new Date(lastDate);
  hideFrom.setDate(hideFrom.getDate() + 1);

  return localToday(options.now) < hideFrom;
}

function upcomingEvents(events, options = {}) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map((event, index) =>
      event && typeof event === "object"
        ? { ...event, _lweIndex: index }
        : event
    )
    .filter((event) => isUpcomingEvent(event, options));
}

function registerCalendarFilters(eleventyConfig) {
  eleventyConfig.addFilter("upcomingEvents", upcomingEvents);
  eleventyConfig.addFilter("isUpcomingEvent", isUpcomingEvent);
}

module.exports = {
  eventLastDate,
  isUpcomingEvent,
  parseLocalDate,
  registerCalendarFilters,
  upcomingEvents,
};
