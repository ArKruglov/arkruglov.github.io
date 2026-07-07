/* ============================================================
   CONFIG - заполни перед запуском
   ============================================================ */

// Ссылка Cal.com вида "username/event-slug".
// Создай на cal.com событие 15–20 мин с включённым "Requires confirmation"
// и вопросами заявки, затем впиши сюда, например: "arkruglov/intro"
const CAL_LINK = "arkruglov/intro";

// Ссылки на соцсети (пустая строка - ссылка скрывается)
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/arkruglov/",
  tiktok: "https://www.tiktok.com/@arkruglov",
  youtube: "https://www.youtube.com/@arkruglov",
  facebook: "https://www.facebook.com/kruglovartemiy",
  linkedin: "",
};

/* ============================================================
   Language toggle (RU / EN)
   ============================================================ */

const LANGS = ["ru", "en"];

function setLang(lang) {
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  const toggle = document.getElementById("lang-toggle");
  toggle.textContent = lang === "ru" ? "EN" : "RU";
  localStorage.setItem("lang", lang);
}

function initLang() {
  const saved = localStorage.getItem("lang");
  if (saved && LANGS.includes(saved)) {
    setLang(saved);
    return;
  }
  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  setLang(browser === "ru" ? "ru" : "en");
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  const current = document.documentElement.dataset.lang;
  setLang(current === "ru" ? "en" : "ru");
});

initLang();

/* ============================================================
   Social links
   ============================================================ */

document.querySelectorAll("[data-social]").forEach((a) => {
  const url = SOCIAL_LINKS[a.dataset.social];
  if (url) {
    a.href = url;
  } else {
    a.style.display = "none";
  }
});

/* ============================================================
   Cal.com inline embed
   Официальный сниппет: https://cal.com/docs/embeds
   ============================================================ */

function initCalEmbed() {
  const container = document.getElementById("cal-embed");
  const fallback = document.getElementById("cal-fallback");

  if (!CAL_LINK) {
    fallback.hidden = false;
    // Если и Instagram не задан - прячем кнопку, остаётся текст
    return;
  }

  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal, ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  Cal("init", "intro", { origin: "https://cal.com" });

  Cal.ns.intro("inline", {
    elementOrSelector: "#cal-embed",
    calLink: CAL_LINK,
    layout: "month_view",
    config: {
      theme: "light",
    },
  });

  Cal.ns.intro("ui", {
    theme: "light",
    styles: { branding: { brandColor: "#8F7248" } },
    hideEventTypeDetails: false,
  });
}

initCalEmbed();
