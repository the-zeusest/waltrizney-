/* Add one uploaded animal icon to every song row and its tarot card. */
(() => {
  "use strict";

  const API_URL = "https://api.github.com/repos/the-zeusest/waltrizney-/contents/assets/animal-icons?ref=main";
  const RAW_PREFIX = "https://raw.githubusercontent.com/the-zeusest/waltrizney-/main/assets/animal-icons/";
  const FALLBACK_ICON = "🐾";
  let iconFiles = [];

  function addStyles() {
    if (document.getElementById("animal-icon-styles")) return;
    const style = document.createElement("style");
    style.id = "animal-icon-styles";
    style.textContent = `
      .song {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .song-animal-icon {
        width: 64px;
        height: 64px;
        flex: 0 0 64px;
        object-fit: contain;
        border-radius: 10px;
        background: #000;
        padding: 2px;
      }
      .song-animal-fallback {
        display: inline-grid;
        place-items: center;
        width: 64px;
        height: 64px;
        flex: 0 0 64px;
        font-size: 2.2rem;
        background: #000;
        border-radius: 10px;
      }
      .song-title { min-width: 0; }
      #cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      #cards .card {
        min-height: 0;
        height: auto;
        padding: 10px 8px;
        background: #000;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
      #cards .card .symbol { display: none; }
      #cards .card strong { margin: 0 0 4px; }
      .card-animal-icon {
        display: block;
        width: 112px;
        height: 112px;
        margin: 0 auto 6px;
        object-fit: contain;
        border-radius: 12px;
        background: #000;
        padding: 0;
      }
      .card-animal-fallback {
        display: block;
        width: 112px;
        height: 112px;
        margin: 0 auto 6px;
        padding-top: 28px;
        box-sizing: border-box;
        text-align: center;
        font-size: 3rem;
        line-height: 1;
        background: #000;
        border-radius: 12px;
      }
      @media (max-width: 640px) {
        .song-animal-icon, .song-animal-fallback {
          width: 52px;
          height: 52px;
          flex-basis: 52px;
        }
        #cards { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        #cards .card { padding: 8px 5px; }
        .card-animal-icon, .card-animal-fallback { width: 82px; height: 82px; }
        .card-animal-fallback { padding-top: 20px; font-size: 2.3rem; }
      }
    `;
    document.head.appendChild(style);
  }

  function iconLabel(filename) {
    return filename
      .replace(/\.(png|jpe?g|webp|gif)$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function fallback(className = "song-animal-fallback") {
    const element = document.createElement("span");
    element.className = className;
    element.textContent = FALLBACK_ICON;
    element.setAttribute("aria-label", "Animal icon");
    return element;
  }

  function makeImage(file, className) {
    const image = document.createElement("img");
    image.className = className;
    image.src = RAW_PREFIX + encodeURIComponent(file.name);
    image.alt = iconLabel(file.name);
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = () => image.replaceWith(fallback(className.replace("-icon", "-fallback")));
    return image;
  }

  function songRows() {
    return [...document.querySelectorAll("#song-list .song, .song")];
  }

  function putIcons() {
    songRows().forEach((row, index) => {
      if (row.querySelector(".song-animal-icon, .song-animal-fallback")) return;
      row.prepend(iconFiles.length ? makeImage(iconFiles[index % iconFiles.length], "song-animal-icon") : fallback());
    });
  }

  function addCardIcons() {
    const rows = songRows();
    document.querySelectorAll("#cards .card").forEach((card, position) => {
      const heading = card.querySelector("strong");
      if (heading) heading.textContent = `Card ${position + 1}`;
      card.querySelector(".symbol")?.remove();
      if (card.querySelector(".card-animal-icon, .card-animal-fallback")) return;

      const link = card.querySelector("a");
      const match = link?.textContent.match(/(\d+)/);
      const songIndex = match ? Number(match[1]) - 1 : -1;
      const row = rows[songIndex];
      const rowIcon = row?.querySelector(".song-animal-icon");
      const icon = rowIcon
        ? rowIcon.cloneNode(true)
        : (iconFiles[songIndex] ? makeImage(iconFiles[songIndex], "card-animal-icon") : fallback("card-animal-fallback"));
      icon.className = rowIcon ? "card-animal-icon" : icon.className;
      card.prepend(icon);
    });
  }

  async function init() {
    addStyles();
    const cards = document.getElementById("cards");
    if (cards) new MutationObserver(addCardIcons).observe(cards, { childList: true, subtree: true });
    try {
      const response = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error(`Icon list request failed: ${response.status}`);
      iconFiles = (await response.json())
        .filter(file => file && file.type === "file" && /\.(png|jpe?g|webp|gif)$/i.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.warn("Animal icons could not be loaded; using paw-print placeholders.", error);
    }
    putIcons();
    addCardIcons();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
