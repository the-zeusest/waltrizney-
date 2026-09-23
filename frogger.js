/* Add one uploaded animal icon to every song row. */
(() => {
  "use strict";

  const API_URL = "https://api.github.com/repos/the-zeusest/waltrizney-/contents/assets/animal-icons?ref=main";
  const RAW_PREFIX = "https://raw.githubusercontent.com/the-zeusest/waltrizney-/main/assets/animal-icons/";
  const FALLBACK_ICON = "🐾";

  function addStyles() {
    if (document.getElementById("animal-icon-styles")) return;
    const style = document.createElement("style");
    style.id = "animal-icon-styles";
    style.textContent = `
      .song {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .song-animal-icon {
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        object-fit: contain;
        border-radius: 8px;
        background: rgba(192, 132, 252, .12);
        padding: 3px;
      }
      .song-animal-fallback {
        display: inline-grid;
        place-items: center;
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        font-size: 1.8rem;
      }
      .song-title { min-width: 0; }
      @media (max-width: 640px) {
        .song-animal-icon, .song-animal-fallback {
          width: 38px;
          height: 38px;
          flex-basis: 38px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function iconLabel(filename) {
    return filename
      .replace(/\.png$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function putIcons(files) {
    const icons = files
      .filter(file => file && file.type === "file" && /\.(png|jpe?g|webp|gif)$/i.test(file.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    const rows = [...document.querySelectorAll("#song-list .song, .song")];

    rows.forEach((row, index) => {
      if (row.querySelector(".song-animal-icon, .song-animal-fallback")) return;
      const file = icons.length ? icons[index % icons.length] : null;
      if (!file) {
        const fallback = document.createElement("span");
        fallback.className = "song-animal-fallback";
        fallback.textContent = FALLBACK_ICON;
        fallback.setAttribute("aria-label", "Animal icon");
        row.prepend(fallback);
        return;
      }
      const image = document.createElement("img");
      image.className = "song-animal-icon";
      image.src = RAW_PREFIX + encodeURIComponent(file.name);
      image.alt = iconLabel(file.name);
      image.loading = "lazy";
      image.decoding = "async";
      image.onerror = () => {
        const fallback = document.createElement("span");
        fallback.className = "song-animal-fallback";
        fallback.textContent = FALLBACK_ICON;
        fallback.setAttribute("aria-label", "Animal icon");
        image.replaceWith(fallback);
      };
      row.prepend(image);
    });
  }

  async function init() {
    addStyles();
    try {
      const response = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error(`Icon list request failed: ${response.status}`);
      putIcons(await response.json());
    } catch (error) {
      console.warn("Animal icons could not be loaded; using paw-print placeholders.", error);
      putIcons([]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
