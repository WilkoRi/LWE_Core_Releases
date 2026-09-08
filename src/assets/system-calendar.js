(function () {
  function parseLocalDate(value) {
    if (typeof value !== "string") return null;

    var match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    var year = Number(match[1]);
    var month = Number(match[2]) - 1;
    var day = Number(match[3]);
    var date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function localToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function shouldHideEvent(element, today) {
    if (element.dataset.eventHidden === "true" || element.dataset.eventVisible === "false") {
      return true;
    }

    var lastDate = parseLocalDate(
      element.dataset.eventShowUntil ||
      element.dataset.eventEnd ||
      element.dataset.eventStart ||
      element.dataset.eventDate ||
      ""
    );

    if (!lastDate) return false;

    var hideFrom = new Date(lastDate);
    hideFrom.setDate(hideFrom.getDate() + 1);

    return today >= hideFrom;
  }

  function updateCalendars() {
    var today = localToday();
    var events = document.querySelectorAll("[data-calendar-event]");

    events.forEach(function (event) {
      var hide = shouldHideEvent(event, today);
      event.hidden = hide;
      event.classList.toggle("is-past-event", hide);
      event.classList.remove("is-calendar-over-limit");
      if (hide) {
        event.setAttribute("aria-hidden", "true");
      } else {
        event.removeAttribute("aria-hidden");
      }
    });

    document.querySelectorAll("[data-calendar-limit-visible]").forEach(function (container) {
      var limit = Number(container.dataset.calendarLimitVisible);
      if (!Number.isFinite(limit) || limit < 1) return;

      var visibleCount = 0;
      container.querySelectorAll("[data-calendar-event]").forEach(function (event) {
        if (event.classList.contains("is-past-event")) return;

        visibleCount += 1;
        var overLimit = visibleCount > limit;
        event.hidden = overLimit;
        event.classList.toggle("is-calendar-over-limit", overLimit);
        if (overLimit) {
          event.setAttribute("aria-hidden", "true");
        } else {
          event.removeAttribute("aria-hidden");
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateCalendars);
  } else {
    updateCalendars();
  }
})();
