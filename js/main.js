document.getElementById('year').textContent = new Date().getFullYear();

// Respect reduced-motion: keep the engine video on its poster frame instead of autoplaying
var engineVideo = document.querySelector('.engine-video');
if (engineVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  engineVideo.removeAttribute('autoplay');
  engineVideo.pause();
}

// Mobile nav toggle
var navToggle = document.getElementById('navToggle');
var mobileNav = document.getElementById('mobileNav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', function () {
    var open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Floating WhatsApp button appears after the hero, not from the first scroll pixel
var whatsFloat = document.querySelector('.whatsapp-float');
var hero = document.querySelector('.hero');
if (whatsFloat && hero) {
  var toggleFloat = function () {
    var heroBottom = hero.getBoundingClientRect().bottom;
    whatsFloat.classList.toggle('visible', heroBottom < 0);
  };
  window.addEventListener('scroll', toggleFloat, { passive: true });
  toggleFloat();
}

// One orchestrated entrance for the hero copy on load (not scattered across every section)
var heroCopy = document.querySelector('.hero-copy');
if (heroCopy && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroCopy.style.opacity = '0';
  heroCopy.style.transform = 'translateY(14px)';
  requestAnimationFrame(function () {
    heroCopy.style.transition = 'opacity 500ms cubic-bezier(.2,0,0,1), transform 500ms cubic-bezier(.2,0,0,1)';
    heroCopy.style.opacity = '1';
    heroCopy.style.transform = 'translateY(0)';
  });
}
