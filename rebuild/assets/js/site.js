(function () {
  "use strict";

  const menuButton = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-site-nav]");

  document.querySelectorAll('a[href="../privacy.html"]').forEach(function (link) {
    link.setAttribute("href", "privacy.html");
  });

  document.querySelectorAll('a[href="../terms.html"]').forEach(function (link) {
    link.setAttribute("href", "terms.html");
  });

  function closeMenu() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(willOpen));
      menuButton.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
      navigation.classList.toggle("is-open", willOpen);
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!navigation.classList.contains("is-open")) return;
      if (navigation.contains(event.target) || menuButton.contains(event.target)) return;
      closeMenu();
    });
  }

  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!revealElements.length || reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(
      function (entries, activeObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  }

  const yearElement = document.querySelector("[data-current-year]");
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
})();
