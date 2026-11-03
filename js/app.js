(() => {
  "use strict";
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => reduceQuery.matches;

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initReveal();
    initCarrusel();
    initDock();
  });

  /* Navegación: scroll suave, barra "glass" y enlace activo */
  function initNav() {
    const barra = document.querySelector(".header__barra");
    const links = [...document.querySelectorAll(".header .navegacion__link")];

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      a.addEventListener("click", (e) => {
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
        history.replaceState(null, "", id);
      });
    });

    const onScroll = () => barra && barra.classList.toggle("pegada", scrollY > 40);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window)) return;
    const mapa = new Map(
      links.map((l) => [document.querySelector(l.getAttribute("href")), l]).filter(([s]) => s)
    );
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.remove("activo"));
        mapa.get(en.target).classList.add("activo");
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    mapa.forEach((_, s) => io.observe(s));
  }

  /* Revelado al hacer scroll con escalonado */
  function initReveal() {
    const sel = ".apuestas__imagen, .listado__elemento, .apuestas-en-vivo__heading, .apuestas__heading," +
      ".categorias__heading, .accordion, .comisiones__heading, .comisiones__texto, .comisiones__imagen," +
      ".testimoniales__heading, .carrusel";
    const els = [...document.querySelectorAll(sel)];
    els.forEach((el) => {
      el.setAttribute("data-reveal", "");
      const hermanos = [...el.parentElement.children].filter((c) => c.matches(".listado__elemento"));
      el.style.setProperty("--i", Math.max(0, hermanos.indexOf(el)));
    });
    if (!("IntersectionObserver" in window) || reduced()) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* Gesto Crossfade: testimonios rotativos con pausa (WCAG 2.2.2) */
  function initCarrusel() {
    const root = document.querySelector(".carrusel");
    if (!root) return;
    const slides = [...root.querySelectorAll("[data-slide]")];
    const puntos = root.querySelector(".carrusel__puntos");
    const btn = root.querySelector(".carrusel__pausa");
    const INTERVALO = 4500;
    let actual = 0, timer = null, pausadoUsuario = reduced(), encima = false;

    const dots = slides.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "carrusel__punto";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", `Testimonio ${i + 1} de ${slides.length}`);
      d.addEventListener("click", () => ir(i));
      puntos.appendChild(d);
      return d;
    });

    function ir(i) {
      actual = (i + slides.length) % slides.length;
      slides.forEach((s, n) => {
        const on = n === actual;
        s.classList.toggle("activo", on);
        s.setAttribute("aria-hidden", String(!on));
        s.toggleAttribute("inert", !on);
      });
      dots.forEach((d, n) => {
        d.setAttribute("aria-selected", String(n === actual));
        d.tabIndex = n === actual ? 0 : -1;
      });
    }
    function ciclo() {
      clearInterval(timer);
      if (!pausadoUsuario && !encima) timer = setInterval(() => ir(actual + 1), INTERVALO);
    }
    function pintaBtn() {
      btn.setAttribute("aria-pressed", String(pausadoUsuario));
      btn.setAttribute("aria-label", pausadoUsuario ? "Reanudar rotación" : "Pausar rotación");
    }

    btn.addEventListener("click", () => { pausadoUsuario = !pausadoUsuario; pintaBtn(); ciclo(); });
    root.addEventListener("pointerenter", () => { encima = true; ciclo(); });
    root.addEventListener("pointerleave", () => { encima = false; ciclo(); });
    root.addEventListener("focusin", () => { encima = true; ciclo(); });
    root.addEventListener("focusout", () => { encima = false; ciclo(); });
    puntos.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      ir(actual + d);
      dots[actual].focus();
    });
    reduceQuery.addEventListener("change", () => { if (reduced()) { pausadoUsuario = true; pintaBtn(); ciclo(); } });

    ir(0); pintaBtn(); ciclo();
  }

  /* Gesto Magnification: el dock crece cerca del puntero */
  function initDock() {
    const dock = document.querySelector(".dock");
    if (!dock) return;
    const items = [...dock.querySelectorAll("a")];
    const BASE = 44, MAX = 78, RANGE = 120;
    let raf = 0;

    const aplica = (x) => {
      items.forEach((a) => {
        let s = BASE;
        if (x !== null && !reduced()) {
          const r = a.getBoundingClientRect();
          const d = Math.abs(x - (r.left + r.width / 2));
          if (d <= RANGE) s = BASE + (MAX - BASE) * Math.cos((d / RANGE) * (Math.PI / 2));
        }
        a.style.setProperty("--size", s + "px");
        a.classList.toggle("grande", s > BASE + 22);
      });
    };
    const mueve = (e) => { cancelAnimationFrame(raf); const x = e.clientX; raf = requestAnimationFrame(() => aplica(x)); };
    const sale = () => { cancelAnimationFrame(raf); aplica(null); };

    dock.addEventListener("pointermove", mueve);
    dock.addEventListener("pointerleave", sale);
    dock.addEventListener("pointercancel", sale);
    dock.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") sale(); });
  }
})();
