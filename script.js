/* ============================================================
   CONFIG
   ============================================================ */

// Ссылка Cal.com вида "username/event-slug"
const CAL_LINK = "arkruglov/intro";

// Ссылки на соцсети (пустая строка - ссылка скрывается)
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/arkruglov/",
  tiktok: "https://www.tiktok.com/@arkruglov",
  youtube: "https://www.youtube.com/@arkruglov",
  facebook: "https://www.facebook.com/kruglovartemiy",
  linkedin: "",
};

const BRAND_COLOR = "#DF4A1C";

/* ============================================================
   Типографика: неразрывные пробелы после коротких слов,
   перед тире и после чисел - чтобы не было висячих предлогов
   ============================================================ */

const NBSP = " ";
const RU_SHORT =
  /(^|[\s(«"])(а|и|но|не|ни|ли|же|бы|б|то|в|во|на|с|со|к|ко|о|об|обо|от|до|по|за|у|из|изо|под|над|при|для|про|без|чем|как|что|или|это|его|её|их|уже|ещё|еще|я|мы|вы|он|она|они|мне|нам|вам)(\s+)/gi;
const EN_SHORT =
  /(^|[\s("])(a|an|the|of|to|in|on|at|by|or|and|for|is|are|it|its|as|be|my|our|we|i|i'm|with|that|you|your|can|will|not|no|so)(\s+)/gi;

function typografText(text, shortWords) {
  let out = text;
  // прогон дважды - для цепочек «и в этом», «to a new»
  for (let pass = 0; pass < 2; pass++) {
    out = out.replace(shortWords, (m, pre, word) => pre + word + NBSP);
  }
  // число + слово: «15 лет», «70 conferences»
  out = out.replace(/(\d)\s+(?=[^\s])/g, "$1" + NBSP);
  // короткое тире не должно начинать строку: nbsp перед ним
  out = out.replace(/\s+-\s+/g, NBSP + "- ");
  return out;
}

function typografElement(root, shortWords) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    if (n.nodeValue && n.nodeValue.trim().length > 1) {
      n.nodeValue = typografText(n.nodeValue, shortWords);
    }
  });
}

function runTypograf() {
  document.querySelectorAll(".ru").forEach((el) => typografElement(el, RU_SHORT));
  document.querySelectorAll(".en").forEach((el) => typografElement(el, EN_SHORT));
}

/* ============================================================
   Language toggle (RU / EN)
   ============================================================ */

const LANGS = ["ru", "en"];

function setLang(lang) {
  const prev = document.documentElement.dataset.lang;
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  document.getElementById("lang-toggle").textContent = lang === "ru" ? "EN" : "RU";
  localStorage.setItem("lang", lang);
  if (prev !== lang && calInitialized) buildCal(lang);
}

function initLang() {
  const saved = localStorage.getItem("lang");
  if (saved && LANGS.includes(saved)) return saved;
  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return browser === "ru" ? "ru" : "en";
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  setLang(document.documentElement.dataset.lang === "ru" ? "en" : "ru");
});

/* ============================================================
   Social links
   ============================================================ */

document.querySelectorAll("[data-social]").forEach((a) => {
  const url = SOCIAL_LINKS[a.dataset.social];
  if (url) a.href = url;
  else a.style.display = "none";
});

/* ============================================================
   FAQ: классический аккордеон - открыт только один вопрос
   ============================================================ */

const faqItems = Array.from(document.querySelectorAll(".faq-item"));
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
  });
});

/* ============================================================
   Cal.com embed
   - десктоп: inline-виджет
   - мобильный: кнопка, открывающая модальное окно Cal
   - locale следует за языком сайта
   ============================================================ */

let calScriptLoaded = false;
function loadCalScript() {
  if (calScriptLoaded) return;
  calScriptLoaded = true;
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
}

let inlineCount = 0;
let calInitialized = false;
const isMobileView = () => window.matchMedia("(max-width: 768px)").matches;

function buildCal(lang) {
  calInitialized = true;
  const container = document.getElementById("cal-embed");
  const mobileBtn = document.getElementById("cal-mobile");
  const fallback = document.getElementById("cal-fallback");

  if (!CAL_LINK) {
    fallback.hidden = false;
    return;
  }
  loadCalScript();

  if (isMobileView()) {
    // Мобильный: компактная кнопка вместо километра слотов
    mobileBtn.hidden = false;
    Cal("init", "mobile", { origin: "https://cal.com" });
    mobileBtn.setAttribute(
      "data-cal-config",
      JSON.stringify({ theme: "light", locale: lang })
    );
    Cal.ns.mobile("ui", {
      theme: "light",
      styles: { branding: { brandColor: BRAND_COLOR } },
    });
  } else {
    mobileBtn.hidden = true;
    container.innerHTML = "";
    const ns = "inline" + ++inlineCount;
    Cal("init", ns, { origin: "https://cal.com" });
    Cal.ns[ns]("inline", {
      elementOrSelector: "#cal-embed",
      calLink: CAL_LINK,
      layout: "month_view",
      config: { theme: "light", locale: lang },
    });
    Cal.ns[ns]("ui", {
      theme: "light",
      styles: { branding: { brandColor: BRAND_COLOR } },
      hideEventTypeDetails: false,
    });
  }
}

/* ============================================================
   Init
   ============================================================ */

runTypograf();
setLang(initLang());
buildCal(document.documentElement.dataset.lang);

// пересборка виджета при смене брейкпоинта (поворот телефона, ресайз окна)
window.matchMedia("(max-width: 768px)").addEventListener("change", () => {
  buildCal(document.documentElement.dataset.lang);
});
