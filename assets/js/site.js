(() => {
  "use strict";
  const progress = document.getElementById("progress");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-navigation");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  let ticking = false;
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + "%";
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  if (menu && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "باز کردن منو");
      menu.querySelector("span").textContent = "☰";
    };
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
      menu.querySelector("span").textContent = open ? "×" : "☰";
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
    addEventListener("resize", () => { if (innerWidth > 700) closeMenu(); }, { passive: true });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: .12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add("is-visible"));

  const sections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        nav.querySelectorAll("a").forEach(a => {
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      }
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => navObserver.observe(section));
  }
})();