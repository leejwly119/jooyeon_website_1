// Year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// IntersectionObserver for reveal-ups
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, {threshold: 0.18});

document.querySelectorAll('.reveal-up').forEach(el=>io.observe(el));

// Gentle marquee restart on tab visibility change
document.addEventListener('visibilitychange', ()=>{
  const track = document.querySelector('.marquee .track');
  if(track){
    track.style.animation = 'none';
    void track.offsetWidth; // restart
    track.style.animation = '';
  }
});

// Expandable Work sub-navigation (hover + keyboard support without flickering)
document.querySelectorAll(".dropdown").forEach(dropdown => {
  let timeout;

  dropdown.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
    dropdown.classList.add("open");
  });

  dropdown.addEventListener("mouseleave", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      dropdown.classList.remove("open");
    }, 400);
  });

  dropdown.addEventListener("focusin", () => {
    clearTimeout(timeout);
    dropdown.classList.add("open");
  });

  dropdown.addEventListener("focusout", (e) => {
    if (!dropdown.contains(e.relatedTarget)) {
      dropdown.classList.remove("open");
    }
  });
});

// Mobile navigation toggle
const navHeader = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");

if (navHeader && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navHeader.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (navHeader.classList.contains("menu-open")) {
        navHeader.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navHeader.classList.contains("menu-open")) {
      navHeader.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900 && navHeader.classList.contains("menu-open")) {
      navHeader.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Active year highlighting on Fine Art page
const yearSections = document.querySelectorAll(".year-section[id]");
const yearLinks = document.querySelectorAll(".nav-yearlink");

if (yearSections.length > 0 && yearLinks.length > 0) {
  const updateActiveYear = () => {
    const triggerLine = window.innerHeight * 0.28;
    let currentId = yearSections[0].id;

    yearSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        currentId = section.id;
      }
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20) {
      currentId = yearSections[yearSections.length - 1].id;
    }

    yearLinks.forEach(link => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href.endsWith(`#${currentId}`));
    });
  };

  window.addEventListener("scroll", updateActiveYear, { passive: true });
  window.addEventListener("hashchange", updateActiveYear);
  updateActiveYear();
}
