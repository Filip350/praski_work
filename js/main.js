const scrollTargets = document.querySelectorAll("a[href^='#'], [data-scroll]");
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const navPill = document.querySelector("[data-nav]");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const marqueeState = {
  track: null,
  row: null,
  distance: 0,
  offset: 0,
  lastTime: 0,
  speed: 40,
};

const updateHeroMarquee = () => {
  if (prefersReducedMotion) {
    return;
  }
  marqueeState.track = document.querySelector(".hero-track");
  marqueeState.row = document.querySelector(".hero-track-row");
  if (!marqueeState.track || !marqueeState.row) {
    return;
  }
  const distance = marqueeState.row.getBoundingClientRect().width;
  if (!distance) {
    return;
  }
  marqueeState.distance = distance;
  marqueeState.track.classList.add("js-marquee");
};

const stepMarquee = (time) => {
  if (prefersReducedMotion || !marqueeState.track || !marqueeState.distance) {
    return;
  }
  if (!marqueeState.lastTime) {
    marqueeState.lastTime = time;
  }
  const delta = time - marqueeState.lastTime;
  marqueeState.lastTime = time;
  marqueeState.offset -= (delta / 1000) * marqueeState.speed;
  marqueeState.offset %= marqueeState.distance;
  marqueeState.track.style.transform = `translate3d(${marqueeState.offset}px, 0, 0)`;
  window.requestAnimationFrame(stepMarquee);
};

const setHeaderState = () => {
  if (!header) {
    return;
  }
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  window.requestAnimationFrame(() => {
    updateHeroMarquee();
  });
});
window.addEventListener("load", () => {
  updateHeroMarquee();
  window.requestAnimationFrame(stepMarquee);
});
updateHeroMarquee();
window.requestAnimationFrame(stepMarquee);

const closeMenu = () => {
  if (!navMenu || !navToggle) {
    return;
  }
  navMenu.classList.remove("is-open");
  navMenu.classList.add("is-closing");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.classList.remove("is-open");
  if (navPill) {
    navPill.classList.remove("is-open");
    navPill.classList.add("is-closing");
  }
  const onTransitionEnd = (event) => {
    if (event.propertyName !== "max-height") {
      return;
    }
    navMenu.classList.remove("is-closing");
    navMenu.removeEventListener("transitionend", onTransitionEnd);
  };
  navMenu.addEventListener("transitionend", onTransitionEnd);
  if (navPill) {
    const onPillTransitionEnd = (event) => {
      if (event.propertyName !== "max-height") {
        return;
      }
      navPill.classList.remove("is-closing");
      navPill.removeEventListener("transitionend", onPillTransitionEnd);
    };
    navPill.addEventListener("transitionend", onPillTransitionEnd);
  }
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
      return;
    }
    navMenu.classList.remove("is-closing");
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.classList.add("is-open");
    if (navPill) {
      navPill.classList.remove("is-closing");
      navPill.classList.add("is-open");
    }
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  });
}

scrollTargets.forEach((target) => {
  target.addEventListener("click", (event) => {
    const selector = target.getAttribute("href") || target.dataset.scroll;
    if (!selector || selector === "#") {
      return;
    }

    const destination = document.querySelector(selector);
    if (!destination) {
      return;
    }

    event.preventDefault();
    destination.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
});

const initCaseLightbox = () => {
  const caseImages = document.querySelectorAll(".case-article img");
  const lightbox = document.querySelector("#lightbox");
  if (!caseImages.length || !lightbox) {
    return;
  }

  const lightboxImage = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const backdrop = lightbox.querySelector("[data-close]");

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.classList.remove("is-zoomed");
    lightboxImage.style.transformOrigin = "center center";
  };

  const openLightbox = (src, alt) => {
    lightboxImage.src = src;
    lightboxImage.alt = alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  caseImages.forEach((img) => {
    img.addEventListener("click", () => {
      openLightbox(img.src, img.alt);
    });
  });

  lightboxImage.addEventListener("click", (event) => {
    const isZoomed = lightboxImage.classList.toggle("is-zoomed");
    if (isZoomed) {
      const rect = lightboxImage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      lightboxImage.style.transformOrigin = `${x}% ${y}%`;
    } else {
      const onTransitionEnd = () => {
        lightboxImage.style.transformOrigin = "center center";
        lightboxImage.removeEventListener("transitionend", onTransitionEnd);
      };
      lightboxImage.addEventListener("transitionend", onTransitionEnd);
    }
  });

  closeBtn.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
};

initCaseLightbox();
