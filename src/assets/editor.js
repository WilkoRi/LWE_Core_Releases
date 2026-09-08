(function () {
  const body = document.body;
  const toggle = document.querySelector("[data-lcb-toggle]");
  const status = document.querySelector("[data-lcb-status]");
  const drawer = document.querySelector("[data-lcb-drawer]");
  const pathLabel = document.querySelector("[data-lcb-path]");
  const fieldLabel = document.querySelector("[data-lcb-field-label]");
  const field = document.querySelector("[data-lcb-field]");
  const urlGroup = document.querySelector("[data-lcb-url-group]");
  const urlField = document.querySelector("[data-lcb-url-field]");
  const saveButton = document.querySelector("[data-lcb-save]");
  const cancelButton = document.querySelector("[data-lcb-cancel]");
  const closeButton = document.querySelector("[data-lcb-close]");
  const message = document.querySelector("[data-lcb-message]");

  let activeElement = null;
  let activeFile = "";
  let activePath = "";
  let activeAttribute = "";
  let activeHrefFile = "";
  let activeHrefPath = "";
  let activeLink = null;
  let originalValue = "";
  let originalHref = "";
  const lcbConfig = window.LCB_CONFIG || {};
  const editPrefix = (lcbConfig.editPrefix || "/__lcb").replace(/\/$/, "");
  const editToken = lcbConfig.editToken || "";
  const contentVersions = { ...(lcbConfig.contentVersions || {}) };

  function editableValue(element) {
    if (activeAttribute) {
      return element.getAttribute(activeAttribute) || "";
    }

    return element.textContent.trim();
  }

  function setEditableValue(element, value) {
    if (activeAttribute) {
      element.setAttribute(activeAttribute, value);
      return;
    }

    element.textContent = value;
  }

  function setEditMode(isActive) {
    body.classList.toggle("lcb-active", isActive);
    toggle.setAttribute("aria-pressed", String(isActive));
    toggle.textContent = isActive ? "Zet uit" : "Zet aan";
    status.textContent = isActive
      ? "Klik op tekst of een bewerkbare link. Zet edit-modus uit om links te openen."
      : "Klik op \"Zet aan\" om tekst te bewerken.";

    if (!isActive) {
      closeDrawer();
    }
  }

  function openDrawer(element) {
    if (activeElement) {
      activeElement.classList.remove("is-selected");
    }
    if (activeLink) {
      activeLink.classList.remove("is-selected");
    }

    activeElement = element;
    const hrefElement = element.dataset.editHrefPath ? element : element.closest("[data-edit-href-path]");
    activeFile = element.dataset.editFile || "";
    activePath = element.dataset.editPath || "";
    activeAttribute = element.dataset.editAttribute || "";
    activeHrefFile = hrefElement ? hrefElement.dataset.editHrefFile || activeFile : "";
    activeHrefPath = hrefElement ? hrefElement.dataset.editHrefPath || "" : "";
    activeLink = element.closest("a");
    originalValue = editableValue(element);
    originalHref = activeLink ? activeLink.dataset.lcbPublicHref || activeLink.getAttribute("href") || "" : "";

    activeElement.classList.add("is-selected");
    if (activeLink) {
      activeLink.classList.add("is-selected");
    }
    pathLabel.textContent = activeHrefPath
      ? `${activeFile} -> ${activePath || "tekst niet bewerkbaar"} | ${activeHrefFile} -> ${activeHrefPath}`
      : `${activeFile} -> ${activePath}`;
    if (fieldLabel) {
      fieldLabel.textContent = activeAttribute === "alt" ? "Alt-tekst" : "Tekst";
    }
    field.value = originalValue;
    field.disabled = !activePath;
    if (urlGroup && urlField) {
      urlGroup.hidden = !activeHrefPath;
      urlField.value = activeHrefPath ? originalHref : "";
    }
    message.textContent = "";
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (activePath) {
      field.focus();
    } else if (urlField) {
      urlField.focus();
    }
  }

  function closeDrawer() {
    if (activeElement) {
      activeElement.classList.remove("is-selected");
    }

    activeElement = null;
    activeFile = "";
    activePath = "";
    activeAttribute = "";
    activeHrefFile = "";
    activeHrefPath = "";
    if (activeLink) {
      activeLink.classList.remove("is-selected");
    }
    activeLink = null;
    originalValue = "";
    originalHref = "";
    pathLabel.textContent = "Geen element gekozen";
    if (fieldLabel) {
      fieldLabel.textContent = "Tekst";
    }
    field.value = "";
    field.disabled = false;
    if (urlGroup && urlField) {
      urlGroup.hidden = true;
      urlField.value = "";
    }
    message.textContent = "";
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function editorHrefFor(publicHref) {
    if (!publicHref || !publicHref.startsWith("/")) {
      return publicHref;
    }

    if (
      publicHref.startsWith(`${editPrefix}/`) ||
      publicHref.startsWith("/api/") ||
      publicHref.startsWith("/__lcb-assets/")
    ) {
      return publicHref;
    }

    return publicHref === "/" ? `${editPrefix}/` : `${editPrefix}${publicHref}`;
  }

  async function saveField(file, path, value) {
    const response = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LWE-Edit-Token": editToken,
      },
      body: JSON.stringify({
        file,
        path,
        value,
        expectedVersion: contentVersions[file] || "",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Opslaan is mislukt.");
    }

    if (result.version) {
      contentVersions[file] = result.version;
    }

    return result;
  }

  async function saveText() {
    if (!activeElement || (!activePath && !(activeHrefFile && activeHrefPath))) {
      return;
    }

    const value = field.value.trim();
    const hrefValue = urlField ? urlField.value.trim() : "";
    saveButton.disabled = true;
    message.textContent = "Opslaan...";

    try {
      if (activePath) {
        await saveField(activeFile, activePath, value);
      }

      if (activeHrefFile && activeHrefPath) {
        await saveField(activeHrefFile, activeHrefPath, hrefValue);
      }

      setEditableValue(activeElement, value);
      originalValue = value;
      if (activeLink && activeHrefPath) {
        activeLink.dataset.lcbPublicHref = hrefValue;
        activeLink.setAttribute("href", editorHrefFor(hrefValue));
        originalHref = hrefValue;
      }
      message.textContent = "Opgeslagen in het contentbestand. 11ty is opnieuw gebouwd.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      saveButton.disabled = false;
    }
  }

  toggle.addEventListener("click", function () {
    setEditMode(!body.classList.contains("lcb-active"));
  });

  document.querySelectorAll('a[href^="/"]').forEach(function (link) {
    const href = link.getAttribute("href");

    if (
      href.startsWith(`${editPrefix}/`) ||
      href.startsWith("/api/") ||
      href.startsWith("/__lcb-assets/")
    ) {
      return;
    }

    link.dataset.lcbPublicHref = href;
    link.href = editorHrefFor(href);
  });

  document.addEventListener("click", function (event) {
    const editable = event.target.closest("[data-edit-path], [data-edit-href-path]");
    const link = event.target.closest("a");

    if (!body.classList.contains("lcb-active")) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (!editable) {
      if (link) {
        event.preventDefault();
        event.stopPropagation();
        status.textContent = "Deze link heeft geen editpad. Zet edit-modus uit om te openen.";
      }
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    openDrawer(editable);
  });

  saveButton.addEventListener("click", saveText);
  cancelButton.addEventListener("click", function () {
    if (activeElement) {
      setEditableValue(activeElement, originalValue);
    }
    if (activeLink && activeHrefPath) {
      activeLink.dataset.lcbPublicHref = originalHref;
      activeLink.setAttribute("href", editorHrefFor(originalHref));
    }
    closeDrawer();
  });
  closeButton.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      if (body.classList.contains("lcb-active")) {
        event.preventDefault();
        saveText();
      }
    }

    if (event.key === "Escape") {
      closeDrawer();
    }
  });
})();
