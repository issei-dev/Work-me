// File: assets/site.js
(() => {
  "use strict";

  const toggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("navigation");

  if (toggle && navigation) {
    function closeMenu(returnFocus = false) {
      navigation.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "メニュー";

      if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", () => {
      const open = navigation.classList.toggle("open");

      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "閉じる" : "メニュー";
    });

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        navigation.classList.contains("open")
      ) {
        closeMenu(true);
      }
    });

    window.matchMedia("(min-width: 761px)")
      .addEventListener("change", event => {
        if (event.matches) {
          closeMenu();
        }
      });
  }

  document.querySelectorAll("[data-photo]").forEach(image => {
    const placeholder = image.parentElement.querySelector(
      ".photo-placeholder"
    );

    function showImage() {
      image.hidden = false;

      if (placeholder) {
        placeholder.hidden = true;
      }
    }

    function showPlaceholder() {
      image.hidden = true;

      if (placeholder) {
        placeholder.hidden = false;
      }
    }

    image.addEventListener("load", showImage);
    image.addEventListener("error", showPlaceholder);

    if (image.complete) {
      if (image.naturalWidth > 0) {
        showImage();
      } else {
        showPlaceholder();
      }
    }
  });

  const search = document.getElementById("search");
  const searchStatus = document.getElementById("search-status");
  const searchableCards = [
    ...document.querySelectorAll("[data-search]")
  ];

  if (search && searchStatus) {
    function filter() {
      const keyword = search.value
        .normalize("NFKC")
        .trim()
        .toLowerCase();

      let count = 0;

      searchableCards.forEach(card => {
        const text = card.dataset.search
          .normalize("NFKC")
          .toLowerCase();

        const matched = text.includes(keyword);

        card.hidden = !matched;

        if (matched) {
          count += 1;
        }
      });

      searchStatus.textContent = count
        ? `${count}件見つかりました。`
        : "別のキーワードでお試しください。";
    }

    search.value = new URLSearchParams(location.search).get("q") || "";
    search.addEventListener("input", filter);
    filter();
  }

  const rail = document.getElementById("advertisements");

  if (!rail) {
    return;
  }

  const ads = [
    {
      name: "Lumière Hair Tokyo",
      image: "assets/images/lumiere-ad.jpg",
      href: "lumiere.html",
      caption: "髪を整えて、私らしい一歩を。",
      background: "#f4ede8"
    },
    {
      name: "PureFit Wellness",
      image: "assets/images/purefit-ad.jpg",
      href: "purefit.html",
      caption: "自宅から始める、私の運動習慣。",
      background: "#eaf2e9"
    },
    {
      name: "Casa Style Interior",
      image: "assets/images/casa-ad.jpg",
      href: "casa.html",
      caption: "新しいキャリア、新しい暮らし。",
      background: "#f1ece3"
    }
  ];

  const link = document.getElementById("ad-link");
  const image = document.getElementById("ad-image");
  const caption = document.getElementById("ad-caption");
  const count = document.getElementById("ad-count");
  const pauseButton = document.getElementById("ad-toggle");
  const nextButton = document.getElementById("ad-next");
  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let index = 0;
  let timer = null;
  let paused = motion.matches;
  let pointerInside = false;
  let visible = true;
  let suspended = false;

  function escapeXml(value) {
    return value.replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    })[character]);
  }

  function fallback(ad) {
    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="600"
        height="600"
        viewBox="0 0 600 600"
      >
        <rect width="600" height="600" fill="${ad.background}" />
        <circle cx="500" cy="110" r="220" fill="#ffffff" opacity="0.5" />
        <text
          x="40"
          y="75"
          font-family="sans-serif"
          font-size="16"
          letter-spacing="3"
          fill="#61756a"
        >ADVERTISEMENT</text>
        <text
          x="40"
          y="295"
          font-family="sans-serif"
          font-size="29"
          font-weight="700"
          fill="#24313a"
        >${escapeXml(ad.name)}</text>
        <path
          d="M40 445H190M172 431L190 445L172 459"
          stroke="#397568"
          stroke-width="3"
          fill="none"
        />
      </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function show() {
    const ad = ads[index];

    link.href = ad.href;
    image.alt = `広告：${ad.name}。紹介ページを見る`;
    caption.textContent = ad.caption;
    count.textContent = `${index + 1} / ${ads.length}`;

    image.onerror = () => {
      image.onerror = null;
      image.src = fallback(ad);
    };

    image.src = ad.image;
  }

  function next() {
    index = (index + 1) % ads.length;
    show();
  }

  function synchronize() {
    window.clearInterval(timer);
    timer = null;

    pauseButton.textContent = paused ? "再開" : "停止";
    pauseButton.setAttribute(
      "aria-label",
      paused
        ? "広告の自動切り替えを再開"
        : "広告の自動切り替えを停止"
    );

    if (
      paused ||
      pointerInside ||
      rail.contains(document.activeElement) ||
      !visible ||
      suspended ||
      document.hidden
    ) {
      return;
    }

    timer = window.setInterval(next, 6000);
  }

  pauseButton.addEventListener("click", () => {
    paused = !paused;
    synchronize();
  });

  nextButton.addEventListener("click", () => {
    next();
    synchronize();
  });

  rail.addEventListener("mouseenter", () => {
    pointerInside = true;
    synchronize();
  });

  rail.addEventListener("mouseleave", () => {
    pointerInside = false;
    synchronize();
  });

  rail.addEventListener("focusin", synchronize);

  rail.addEventListener("focusout", () => {
    window.setTimeout(synchronize, 0);
  });

  document.addEventListener("visibilitychange", synchronize);

  motion.addEventListener("change", event => {
    if (event.matches) {
      paused = true;
    }

    synchronize();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      synchronize();
    });

    observer.observe(rail);
  }

  window.addEventListener("pagehide", () => {
    suspended = true;
    window.clearInterval(timer);
  });

  window.addEventListener("pageshow", () => {
    suspended = false;
    synchronize();
  });

  show();
  synchronize();
})();
