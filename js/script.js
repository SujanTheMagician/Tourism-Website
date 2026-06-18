/* =========================================================
   Teju Tours — interactions (vanilla JS, no dependencies)
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Theme (persisted + system aware) ---------- */
  const themeToggle = $("#themeToggle");
  const stored = localStorage.getItem("tt-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = stored || (prefersLight ? "light" : "dark");
  root.setAttribute("data-theme", initial);

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("tt-theme", next);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0E1116" : "#F7F5F2");
  });

  /* ---------- Sticky nav shadow ---------- */
  const nav = $("#nav");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    burger.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };
  burger?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scrollspy: highlight active link ---------- */
  const sections = $$("section[id], header[id]");
  const linkFor = (id) => $(`#navLinks a[href="#${id}"]`);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $$("#navLinks a").forEach((a) => a.classList.remove("is-active"));
            linkFor(entry.target.id)?.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  window.addEventListener(
    "scroll",
    () => toTop.classList.toggle("is-visible", window.scrollY > 600),
    { passive: true }
  );
  toTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  /* ---------- Carousel ---------- */
  const track = $("#carouselTrack");
  if (track) {
    const slides = $$(".carousel__slide", track);
    const dotsWrap = $("#carouselDots");
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = $$("button", dotsWrap);

    function go(i, user) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      if (user) restart();
    }
    const next = () => go(index + 1);
    const prev = () => go(index - 1);
    $("#carouselNext")?.addEventListener("click", () => go(index + 1, true));
    $("#carouselPrev")?.addEventListener("click", () => go(index - 1, true));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function start() {
      if (!reduce) timer = setInterval(next, 5000);
    }
    function restart() {
      clearInterval(timer);
      start();
    }
    const carousel = $("#carousel");
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", start);
    start();
  }

  /* ---------- Contact form (client-side validation) ---------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus");
    const setError = (name, msg) => {
      const field = form.querySelector(`#${name}`)?.closest(".field");
      const err = form.querySelector(`.field__error[data-for="${name}"]`);
      if (field) field.classList.toggle("has-error", Boolean(msg));
      if (err) err.textContent = msg || "";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const remarks = form.remarks.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      let valid = true;

      setError("name", name ? "" : ((valid = false), "Please tell us your name."));
      setError(
        "email",
        emailOk ? "" : ((valid = false), "Enter a valid email address.")
      );
      setError(
        "remarks",
        remarks ? "" : ((valid = false), "Let us know how we can help.")
      );

      if (!valid) {
        status.textContent = "";
        return;
      }
      status.textContent = `Thanks, ${name.split(" ")[0]}! Your message is on its way. ✈️`;
      form.reset();
    });

    ["name", "email", "remarks"].forEach((n) =>
      form.querySelector(`#${n}`)?.addEventListener("input", () => setError(n, ""))
    );
  }

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
