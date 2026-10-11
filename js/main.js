var root = document.documentElement;
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var WHATS_NUMBER = '556392623059';

document.getElementById('year').textContent = new Date().getFullYear();

// Motion only when the visitor hasn't asked for less of it; without this class every element renders in its final state
if (!reduceMotion) root.classList.add('js-motion');
requestAnimationFrame(function () {
  requestAnimationFrame(function () { root.classList.add('loaded'); });
});

// Reduced motion keeps the engine video on its poster frame; otherwise pause it while off-screen to save battery
var engineVideo = document.querySelector('.engine-video');
if (engineVideo) {
  if (reduceMotion) {
    engineVideo.removeAttribute('autoplay');
    engineVideo.pause();
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { var p = engineVideo.play(); if (p && p.catch) p.catch(function () {}); }
        else engineVideo.pause();
      });
    }).observe(engineVideo);
  }
}

// Mobile menu: full-screen overlay, hamburger morphs into an X
var navToggle = document.getElementById('navToggle');
var mobileNav = document.getElementById('mobileNav');
if (navToggle && mobileNav) {
  var setMenu = function (open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      mobileNav.hidden = false;
      requestAnimationFrame(function () { mobileNav.classList.add('open'); });
    } else {
      mobileNav.classList.remove('open');
      setTimeout(function () { if (!mobileNav.classList.contains('open')) mobileNav.hidden = true; }, reduceMotion ? 0 : 320);
    }
  };
  navToggle.addEventListener('click', function () {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); navToggle.focus(); }
  });
}

if ('IntersectionObserver' in window) {
  // Scroll reveals
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  // "40+ anos" counts up the first time it appears, so the number gets a beat of attention
  if (!reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        var el = entry.target, target = parseInt(el.dataset.count, 10), start = null;
        var step = function (t) {
          if (start === null) start = t;
          var k = Math.min((t - start) / 1400, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { countObserver.observe(el); });
  }

  // Warning lights switch on in sequence when the cluster comes into view, like a car's ignition check
  var cluster = document.getElementById('cluster');
  if (cluster) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { cluster.classList.add('lit'); obs.disconnect(); }
      });
    }, { threshold: 0.45 }).observe(cluster);
  }

  // Floating WhatsApp button appears once the hero (with its own CTA) has left the screen
  var whatsFloat = document.getElementById('whatsFloat');
  var hero = document.querySelector('.hero');
  if (whatsFloat && hero) {
    new IntersectionObserver(function (entries) {
      whatsFloat.classList.toggle('visible', !entries[0].isIntersecting);
    }).observe(hero);
  }

  // Current section highlighted in the desktop nav
  var navLinks = document.querySelectorAll('.main-nav a');
  var sections = Array.prototype.map.call(navLinks, function (a) { return document.querySelector(a.getAttribute('href')); });
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { if (s) sectionObserver.observe(s); });
}

// Scroll-scrubbed storytelling (GSAP): the manifesto lights up word by word and oil flows through the process pipe
if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap-on');

  var manifesto = document.getElementById('manifesto');
  if (manifesto) {
    var highlight = ['barato', 'motor', 'mais', 'caro'];
    var words = manifesto.textContent.trim().split(/\s+/);
    manifesto.setAttribute('aria-label', manifesto.textContent.trim());
    manifesto.innerHTML = words.map(function (w, i) {
      var clean = w.replace(/[.,]/g, '').toLowerCase();
      var hl = i >= 10 && highlight.indexOf(clean) !== -1 ? ' hl' : '';
      return '<span class="w' + hl + '" aria-hidden="true">' + w + '</span>';
    }).join(' ');
    var wordEls = manifesto.querySelectorAll('.w');
    ScrollTrigger.create({
      trigger: manifesto,
      start: 'top 85%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: function (self) {
        var lit = Math.round(self.progress * wordEls.length);
        wordEls.forEach(function (el, i) { el.classList.toggle('on', i < lit); });
      }
    });
  }

  var pipeFill = document.getElementById('pipeFill');
  if (pipeFill) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      gsap.fromTo(pipeFill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#pipeline', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } });
    });
    mm.add('(max-width: 860px)', function () {
      gsap.fromTo(pipeFill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#pipeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } });
    });
  }
}

// "Aberto agora" badge, computed in Araguaína's own time zone
var openStatus = document.getElementById('openStatus');
if (openStatus) {
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Araguaina', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date())
      .reduce(function (acc, p) { acc[p.type] = p.value; return acc; }, {});
    var minutes = (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10);
    var day = parts.weekday;
    var weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day) !== -1;
    var isOpen = (weekday && minutes >= 480 && minutes < 1020) || (day === 'Sat' && minutes >= 480 && minutes < 720);
    openStatus.textContent = isOpen ? 'Aberto agora' : 'Fechado agora';
    openStatus.classList.add(isOpen ? 'is-open' : 'is-closed');
    openStatus.hidden = false;
  } catch (e) { /* Intl without time zone support: the badge simply stays hidden */ }
}

// Oil-change calculator
var calcForm = document.getElementById('calcForm');
if (calcForm) {
  var kmLast = document.getElementById('kmLast');
  var kmNow = document.getElementById('kmNow');
  var kmNowError = document.getElementById('kmNowError');
  var panel = document.getElementById('gaugePanel');
  var fill = document.getElementById('gaugeFill');
  var needle = document.getElementById('gaugeNeedle');
  var pctEl = document.getElementById('gaugePct');
  var statusEl = document.getElementById('gaugeStatus');
  var detailEl = document.getElementById('gaugeDetail');
  var cta = document.getElementById('gaugeCta');
  var defaultHref = cta.getAttribute('href');

  var fmt = function (n) { return n.toLocaleString('pt-BR'); };
  var digits = function (s) { return parseInt(String(s).replace(/\D/g, ''), 10); };

  // Keep the thousands separator as the visitor types
  [kmLast, kmNow].forEach(function (input) {
    input.addEventListener('input', function () {
      var n = digits(input.value);
      input.value = isNaN(n) ? '' : fmt(Math.min(n, 9999999));
    });
  });

  var setGauge = function (ratio) {
    var r = Math.max(0, Math.min(ratio, 1));
    fill.style.strokeDashoffset = String(100 - r * 100);
    needle.style.transform = 'rotate(' + (-90 + r * 180) + 'deg)';
  };

  var render = function () {
    var last = digits(kmLast.value);
    var now = digits(kmNow.value);
    var interval = parseInt(calcForm.querySelector('input[name="oil"]:checked').value, 10);
    var months = parseInt(calcForm.querySelector('input[name="months"]:checked').value, 10);

    kmNow.removeAttribute('aria-invalid');
    kmNowError.textContent = '';

    if (isNaN(last) || isNaN(now)) {
      panel.dataset.state = 'empty';
      setGauge(0);
      pctEl.textContent = '--';
      statusEl.textContent = 'Preencha os dois campos de quilometragem';
      detailEl.textContent = 'O ponteiro mostra quanto da vida útil do óleo você já rodou.';
      cta.setAttribute('href', defaultHref);
      return;
    }

    if (now < last) {
      kmNow.setAttribute('aria-invalid', 'true');
      kmNowError.textContent = 'O km atual precisa ser maior que o da última troca.';
      panel.dataset.state = 'empty';
      setGauge(0);
      pctEl.textContent = '--';
      statusEl.textContent = 'Confira a quilometragem informada';
      detailEl.textContent = 'Corrija o km atual para ver o resultado.';
      return;
    }

    var driven = now - last;
    var ratio = driven / interval;
    var remaining = interval - driven;
    var state, status, detail;

    if (ratio >= 1 || months > 6) {
      state = 'late';
      status = 'Troca vencida';
      detail = ratio >= 1
        ? 'Você já passou ' + fmt(Math.abs(remaining)) + ' km do intervalo recomendado.'
        : 'Mesmo rodando pouco, óleo com mais de 6 meses perde proteção.';
    } else if (ratio >= 0.75 || months > 3) {
      state = 'soon';
      status = 'Programe a troca';
      detail = 'Faltam cerca de ' + fmt(remaining) + ' km. Bom momento para passar na TI.';
    } else {
      state = 'ok';
      status = 'Óleo em dia';
      detail = 'Ainda restam cerca de ' + fmt(remaining) + ' km até a próxima troca.';
    }

    panel.dataset.state = state;
    setGauge(months > 6 ? Math.max(ratio, 1) : ratio);
    pctEl.textContent = Math.round(ratio * 100) + '%';
    statusEl.textContent = status;
    detailEl.textContent = detail;

    var msg = 'Oi, Iranilton! Usei a calculadora do site: rodei ' + fmt(driven) + ' km desde a última troca (' + status.toLowerCase() + '). Quero verificar o óleo do meu carro.';
    cta.setAttribute('href', 'https://wa.me/' + WHATS_NUMBER + '?text=' + encodeURIComponent(msg));
  };

  calcForm.addEventListener('input', render);
  calcForm.addEventListener('change', render);
  calcForm.addEventListener('submit', function (e) { e.preventDefault(); render(); });
}
