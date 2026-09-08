(function () {
  const body = document.body;
  const toggle = document.querySelector("[data-lcb-toggle]");
  const status = document.querySelector("[data-lcb-status]");
  const drawer = document.querySelector("[data-lcb-drawer]");
  const drawerTitle = document.querySelector("[data-lcb-editor-title]");
  const pathLabel = document.querySelector("[data-lcb-path]");
  const textGroup = document.querySelector("[data-lcb-text-group]");
  const fieldLabel = document.querySelector("[data-lcb-field-label]");
  const field = document.querySelector("[data-lcb-field]");
  const urlGroup = document.querySelector("[data-lcb-url-group]");
  const urlField = document.querySelector("[data-lcb-url-field]");
  const imageSrcGroup = document.querySelector("[data-lcb-image-src-group]");
  const imageSrcField = document.querySelector("[data-lcb-image-src-field]");
  const imagePreviewBox = document.querySelector("[data-lcb-image-preview-box]");
  const imagePreview = document.querySelector("[data-lcb-image-preview]");
  const imagePreviewCaption = document.querySelector("[data-lcb-image-preview-caption]");
  const imageSelect = document.querySelector("[data-lcb-image-select]");
  const imageRefreshButton = document.querySelector("[data-lcb-image-refresh]");
  const imageOpenFolderButton = document.querySelector("[data-lcb-image-open-folder]");
  const imageAltGroup = document.querySelector("[data-lcb-image-alt-group]");
  const imageAltField = document.querySelector("[data-lcb-image-alt-field]");
  const imageRatioGroup = document.querySelector("[data-lcb-image-ratio-group]");
  const imageRatioButtons = Array.from(document.querySelectorAll("[data-lcb-image-ratio-button]"));
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
  let activeImage = null;
  let activeImageSrcFile = "";
  let activeImageSrcPath = "";
  let activeImageAltFile = "";
  let activeImageAltPath = "";
  let activeImageRatioFile = "";
  let activeImageRatioPath = "";
  let originalValue = "";
  let originalHref = "";
  let originalImageSrc = "";
  let originalImageAlt = "";
  let originalImageRatio = "";
  let availableImages = [];
  const imageRatios = new Set(["landscape", "square", "portrait"]);
  const lcbConfig = window.LCB_CONFIG || {};
  const editPrefix = (lcbConfig.editPrefix || "/__lcb").replace(/\/$/, "");
  const rootEditPath = lcbConfig.rootEditPath || `${editPrefix}/_root/`;
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

  async function readJsonResponse(response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  }

  async function readField(file, path) {
    const response = await fetch("/api/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LWE-Edit-Token": editToken,
      },
      body: JSON.stringify({ file, path }),
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(result.error || "Lezen is mislukt.");
    }

    if (result.version) {
      contentVersions[file] = result.version;
    }

    return result.value;
  }

  async function postEditorJson(endpoint, body = {}) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LWE-Edit-Token": editToken,
      },
      body: JSON.stringify(body),
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(result.error || "Actie is mislukt.");
    }

    return result;
  }

  function imageNameFromUrl(value) {
    const parts = String(value || "").split("/");
    return parts[parts.length - 1] || value || "Geen afbeelding gekozen";
  }

  function previewUrlFor(value) {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
      return "";
    }

    return value;
  }

  function updateImagePreview(value) {
    if (!imagePreviewBox || !imagePreview || !imagePreviewCaption) {
      return;
    }

    const previewUrl = previewUrlFor(value);

    if (!previewUrl) {
      imagePreviewBox.hidden = true;
      imagePreview.removeAttribute("src");
      imagePreviewCaption.textContent = "Geen lokale preview beschikbaar";
      return;
    }

    imagePreview.src = previewUrl;
    imagePreviewCaption.textContent = imageNameFromUrl(value);
    imagePreviewBox.hidden = false;
  }

  function normalizeImageRatio(value) {
    return imageRatios.has(value) ? value : "landscape";
  }

  function setImageRatioUi(value) {
    const nextValue = normalizeImageRatio(value);

    for (const button of imageRatioButtons) {
      button.setAttribute("aria-pressed", String(button.value === nextValue));
    }
  }

  function applyImageRatio(value) {
    const nextValue = normalizeImageRatio(value);

    setImageRatioUi(nextValue);

    if (activeImage) {
      activeImage.dataset.imageRatio = nextValue;
      const frame = activeImage.closest("[data-image-ratio-frame]");

      if (frame) {
        frame.dataset.imageRatio = nextValue;
      }
    }
  }

  function populateImageSelect(currentValue) {
    if (!imageSelect) {
      return;
    }

    imageSelect.replaceChildren();

    if (!availableImages.some((image) => image.url === currentValue) && currentValue) {
      const option = document.createElement("option");
      option.value = currentValue;
      option.textContent = `Huidige afbeelding: ${imageNameFromUrl(currentValue)}`;
      imageSelect.append(option);
    }

    if (!availableImages.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Geen afbeeldingen gevonden";
      imageSelect.append(option);
      imageSelect.value = "";
      return;
    }

    for (const image of availableImages) {
      const option = document.createElement("option");
      option.value = image.url;
      option.textContent = image.name;
      imageSelect.append(option);
    }

    imageSelect.value = currentValue || availableImages[0].url;
  }

  async function loadImages({ refresh = false } = {}) {
    if (!imageSelect) {
      return;
    }

    const activeValue = imageSrcField ? imageSrcField.value.trim() : "";

    try {
      if (imageRefreshButton) {
        imageRefreshButton.disabled = true;
        imageRefreshButton.textContent = refresh ? "Bezig met verversen..." : "Afbeeldingen laden...";
      }

      const result = await postEditorJson(refresh ? "/api/images/refresh" : "/api/images/list");
      availableImages = Array.isArray(result.images) ? result.images : [];
      populateImageSelect(activeValue);

      if (refresh) {
        message.textContent = `Afbeeldingen ververst en website opnieuw gebouwd: ${availableImages.length} beschikbaar.`;
      }
    } catch (error) {
      message.textContent = error.message;
    } finally {
      if (imageRefreshButton) {
        imageRefreshButton.disabled = false;
        imageRefreshButton.textContent = "Afbeeldingen verversen";
      }
    }
  }

  async function openImageFolder() {
    if (!imageOpenFolderButton) {
      return;
    }

    try {
      imageOpenFolderButton.disabled = true;
      imageOpenFolderButton.textContent = "Map openen...";

      const result = await postEditorJson("/api/images/open-folder");
      message.textContent = result.directory
        ? `Afbeeldingenmap geopend: ${result.directory}`
        : "Afbeeldingenmap geopend.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      imageOpenFolderButton.disabled = false;
      imageOpenFolderButton.textContent = "Open afbeeldingenmap";
    }
  }

  function setEditMode(isActive) {
    body.classList.toggle("lcb-active", isActive);
    toggle.setAttribute("aria-pressed", String(isActive));
    toggle.textContent = isActive ? "Zet uit" : "Zet aan";
    status.textContent = isActive
      ? "Klik op tekst, afbeelding of een bewerkbare link. Zet edit-modus uit om links te openen."
      : "Klik op \"Zet aan\" om tekst en afbeeldingen te bewerken.";

    if (!isActive) {
      closeDrawer();
    }
  }

  async function openDrawer(element) {
    if (activeElement) {
      activeElement.classList.remove("is-selected");
    }
    if (activeLink) {
      activeLink.classList.remove("is-selected");
    }

    activeElement = element;
    const hrefElement = element.dataset.editHrefPath ? element : element.closest("[data-edit-href-path]");
    const imageElement = element.dataset.editSrcPath ? element : element.closest("[data-edit-src-path]");
    activeFile = element.dataset.editFile || "";
    activePath = element.dataset.editPath || "";
    activeAttribute = element.dataset.editAttribute || "";
    activeHrefFile = hrefElement ? hrefElement.dataset.editHrefFile || activeFile : "";
    activeHrefPath = hrefElement ? hrefElement.dataset.editHrefPath || "" : "";
    activeLink = element.closest("a");
    activeImage = imageElement || null;
    activeImageSrcFile = activeImage ? activeImage.dataset.editSrcFile || activeImage.dataset.editFile || activeFile : "";
    activeImageSrcPath = activeImage ? activeImage.dataset.editSrcPath || "" : "";
    activeImageAltFile = activeImage ? activeImage.dataset.editAltFile || activeImageSrcFile : "";
    activeImageAltPath = activeImage ? activeImage.dataset.editAltPath || "" : "";
    activeImageRatioFile = activeImage ? activeImage.dataset.editRatioFile || activeImageSrcFile : "";
    activeImageRatioPath = activeImage ? activeImage.dataset.editRatioPath || "" : "";
    originalValue = editableValue(element);
    originalHref = activeLink ? activeLink.dataset.lcbPublicHref || activeLink.getAttribute("href") || "" : "";
    originalImageSrc = activeImage ? activeImage.getAttribute("src") || "" : "";
    originalImageAlt = activeImage ? activeImage.getAttribute("alt") || "" : "";
    originalImageRatio = activeImage ? normalizeImageRatio(activeImage.dataset.imageRatio || "") : "";

    activeElement.classList.add("is-selected");
    if (activeLink) {
      activeLink.classList.add("is-selected");
    }
    if (activeImageSrcPath) {
      if (drawerTitle) {
        drawerTitle.textContent = "Bewerk afbeelding";
      }
      pathLabel.textContent = activeImageAltPath
        ? `${activeImageSrcFile} -> ${activeImageSrcPath} | ${activeImageAltFile} -> ${activeImageAltPath}${activeImageRatioPath ? ` | ${activeImageRatioFile} -> ${activeImageRatioPath}` : ""}`
        : `${activeImageSrcFile} -> ${activeImageSrcPath}`;
    } else {
      if (drawerTitle) {
        drawerTitle.textContent = activeHrefPath ? "Bewerk link" : "Bewerk tekst";
      }
      pathLabel.textContent = activeHrefPath
        ? `${activeFile} -> ${activePath || "tekst niet bewerkbaar"} | ${activeHrefFile} -> ${activeHrefPath}`
        : `${activeFile} -> ${activePath}`;
    }
    if (fieldLabel) {
      fieldLabel.textContent = activeAttribute === "alt" ? "Alt-tekst" : "Tekst";
    }
    field.value = originalValue;
    field.disabled = !activePath;
    if (textGroup) {
      textGroup.hidden = !activePath;
    }
    if (urlGroup && urlField) {
      urlGroup.hidden = !activeHrefPath;
      urlField.value = activeHrefPath ? originalHref : "";
    }
    if (imageSrcGroup && imageSrcField) {
      imageSrcGroup.hidden = !activeImageSrcPath;
      imageSrcField.value = activeImageSrcPath ? originalImageSrc : "";
      if (activeImageSrcPath) {
        updateImagePreview(originalImageSrc);
        populateImageSelect(originalImageSrc);
        loadImages();
      }
    }
    if (imageAltGroup && imageAltField) {
      imageAltGroup.hidden = !activeImageAltPath;
      imageAltField.value = activeImageAltPath ? originalImageAlt : "";
    }
    if (imageRatioGroup) {
      imageRatioGroup.hidden = !activeImageRatioPath;
      setImageRatioUi(originalImageRatio);
    }
    message.textContent = "";
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (activePath) {
      field.focus();
      try {
        const selectedElement = activeElement;
        const selectedFile = activeFile;
        const selectedPath = activePath;
        const value = await readField(activeFile, activePath);

        if (activeElement === selectedElement && activeFile === selectedFile && activePath === selectedPath) {
          field.value = value;
          originalValue = value;
        }
      } catch (error) {
        message.textContent = error.message;
      }
    } else if (activeImageSrcPath && imageSrcField) {
      imageSrcField.focus();
      try {
        const selectedImage = activeImage;
        const selectedFile = activeImageSrcFile;
        const selectedPath = activeImageSrcPath;
        const value = await readField(activeImageSrcFile, activeImageSrcPath);

        if (activeImage === selectedImage && activeImageSrcFile === selectedFile && activeImageSrcPath === selectedPath) {
          imageSrcField.value = value;
          originalImageSrc = value;
          updateImagePreview(value);
          populateImageSelect(value);
        }
      } catch (error) {
        message.textContent = error.message;
      }
    } else if (urlField) {
      urlField.focus();
    }

    if (activeImageAltPath && imageAltField) {
      try {
        const selectedImage = activeImage;
        const selectedFile = activeImageAltFile;
        const selectedPath = activeImageAltPath;
        const value = await readField(activeImageAltFile, activeImageAltPath);

        if (activeImage === selectedImage && activeImageAltFile === selectedFile && activeImageAltPath === selectedPath) {
          imageAltField.value = value;
          originalImageAlt = value;
        }
      } catch (error) {
        message.textContent = error.message;
      }
    }

    if (activeImageRatioPath) {
      try {
        const selectedImage = activeImage;
        const selectedFile = activeImageRatioFile;
        const selectedPath = activeImageRatioPath;
        const value = normalizeImageRatio(await readField(activeImageRatioFile, activeImageRatioPath));

        if (activeImage === selectedImage && activeImageRatioFile === selectedFile && activeImageRatioPath === selectedPath) {
          originalImageRatio = value;
          applyImageRatio(value);
        }
      } catch (error) {
        message.textContent = error.message;
      }
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
    activeImage = null;
    activeImageSrcFile = "";
    activeImageSrcPath = "";
    activeImageAltFile = "";
    activeImageAltPath = "";
    activeImageRatioFile = "";
    activeImageRatioPath = "";
    if (activeLink) {
      activeLink.classList.remove("is-selected");
    }
    activeLink = null;
    originalValue = "";
    originalHref = "";
    originalImageSrc = "";
    originalImageAlt = "";
    originalImageRatio = "";
    pathLabel.textContent = "Geen element gekozen";
    if (drawerTitle) {
      drawerTitle.textContent = "Bewerk tekst";
    }
    if (fieldLabel) {
      fieldLabel.textContent = "Tekst";
    }
    field.value = "";
    field.disabled = false;
    if (textGroup) {
      textGroup.hidden = false;
    }
    if (urlGroup && urlField) {
      urlGroup.hidden = true;
      urlField.value = "";
    }
    if (imageSrcGroup && imageSrcField) {
      imageSrcGroup.hidden = true;
      imageSrcField.value = "";
    }
    if (imagePreviewBox && imagePreview && imagePreviewCaption) {
      imagePreviewBox.hidden = true;
      imagePreview.removeAttribute("src");
      imagePreviewCaption.textContent = "Geen afbeelding gekozen";
    }
    if (imageSelect) {
      imageSelect.replaceChildren();
    }
    if (imageAltGroup && imageAltField) {
      imageAltGroup.hidden = true;
      imageAltField.value = "";
    }
    if (imageRatioGroup) {
      imageRatioGroup.hidden = true;
      setImageRatioUi("landscape");
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

    return publicHref === "/" ? rootEditPath : `${editPrefix}${publicHref}`;
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

    const result = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(result.error || "Opslaan is mislukt.");
    }

    if (result.version) {
      contentVersions[file] = result.version;
    }

    return result;
  }

  async function saveText() {
    if (!activeElement || (!activePath && !(activeHrefFile && activeHrefPath) && !(activeImageSrcFile && activeImageSrcPath) && !(activeImageRatioFile && activeImageRatioPath))) {
      return;
    }

    const value = field.value.trim();
    const hrefValue = urlField ? urlField.value.trim() : "";
    const imageSrcValue = imageSrcField ? imageSrcField.value.trim() : "";
    const imageAltValue = imageAltField ? imageAltField.value.trim() : "";
    const imageRatioValue = normalizeImageRatio(imageRatioButtons.find((button) => button.getAttribute("aria-pressed") === "true")?.value || originalImageRatio);
    saveButton.disabled = true;
    message.textContent = "Opslaan...";

    try {
      if (activePath) {
        await saveField(activeFile, activePath, value);
      }

      if (activeHrefFile && activeHrefPath) {
        await saveField(activeHrefFile, activeHrefPath, hrefValue);
      }

      if (activeImageSrcFile && activeImageSrcPath) {
        await saveField(activeImageSrcFile, activeImageSrcPath, imageSrcValue);
      }

      if (activeImageAltFile && activeImageAltPath) {
        await saveField(activeImageAltFile, activeImageAltPath, imageAltValue);
      }

      if (activeImageRatioFile && activeImageRatioPath) {
        await saveField(activeImageRatioFile, activeImageRatioPath, imageRatioValue);
      }

      if (activeElement.dataset.editRender) {
        window.location.reload();
        return;
      }

      if (activePath) {
        setEditableValue(activeElement, value);
        originalValue = value;
      }
      if (activeLink && activeHrefPath) {
        activeLink.dataset.lcbPublicHref = hrefValue;
        activeLink.setAttribute("href", editorHrefFor(hrefValue));
        originalHref = hrefValue;
      }
      if (activeImage && activeImageSrcPath) {
        activeImage.setAttribute("src", imageSrcValue);
        originalImageSrc = imageSrcValue;
        updateImagePreview(imageSrcValue);
      }
      if (activeImage && activeImageAltPath) {
        activeImage.setAttribute("alt", imageAltValue);
        originalImageAlt = imageAltValue;
      }
      if (activeImage && activeImageRatioPath) {
        applyImageRatio(imageRatioValue);
        originalImageRatio = imageRatioValue;
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
    const editable = event.target.closest("[data-edit-path], [data-edit-href-path], [data-edit-src-path]");
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
  if (imageSrcField) {
    imageSrcField.addEventListener("input", function () {
      updateImagePreview(imageSrcField.value.trim());
      populateImageSelect(imageSrcField.value.trim());
    });
  }
  if (imageSelect && imageSrcField) {
    imageSelect.addEventListener("change", function () {
      if (!imageSelect.value) {
        return;
      }

      imageSrcField.value = imageSelect.value;
      updateImagePreview(imageSelect.value);
    });
  }
  if (imageRefreshButton) {
    imageRefreshButton.addEventListener("click", function () {
      loadImages({ refresh: true });
    });
  }
  if (imageOpenFolderButton) {
    imageOpenFolderButton.addEventListener("click", openImageFolder);
  }
  for (const button of imageRatioButtons) {
    button.addEventListener("click", function () {
      applyImageRatio(button.value);
    });
  }
  cancelButton.addEventListener("click", function () {
    if (activeElement) {
      setEditableValue(activeElement, originalValue);
    }
    if (activeLink && activeHrefPath) {
      activeLink.dataset.lcbPublicHref = originalHref;
      activeLink.setAttribute("href", editorHrefFor(originalHref));
    }
    if (activeImage && activeImageSrcPath) {
      activeImage.setAttribute("src", originalImageSrc);
    }
    if (activeImage && activeImageAltPath) {
      activeImage.setAttribute("alt", originalImageAlt);
    }
    if (activeImage && activeImageRatioPath) {
      applyImageRatio(originalImageRatio);
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
