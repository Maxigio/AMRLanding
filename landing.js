/* Auto Moto Radar — landing (statica). Tema + wizard di profilazione -> WhatsApp.
   Niente rete, niente API. Tutte le opzioni del wizard sono costanti fisse. */
(function () {
  'use strict';

  var THEME_KEY = 'amr_landing_theme';
  var WA_NUMBER = '393520727252';

  // ─── Tema: toggle light/dark, persistito (chiave propria, non quella dell'app) ───
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  function applyGlyph() {
    if (!toggle) return;
    // ☀ in dark (passa a chiaro), ☾ in light (passa a scuro)
    var dark = root.getAttribute('data-theme') === 'dark';
    toggle.textContent = dark ? '☀' : '☾';
    // Stato e descrizione per gli screen reader, coerenti col glifo.
    toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    var label = dark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }
  applyGlyph();
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyGlyph();
    });
  }

  // ─── Configuratore "il tuo Auto Moto Radar" (4 passi) → WhatsApp ───────────────
  // Chiude una frase con un punto senza raddoppiare se finisce già con . ! ? …
  function dot(s) { return /[.!?…]$/.test(s) ? s : s + '.'; }

  // Opzioni: SOLO costanti fisse (nessun input libero → nessuna iniezione).
  var PROFILI = ['Concessionario', 'Commerciante', 'Privato'];
  var TIPI = ['Auto', 'Moto', 'Auto e moto'];
  var OBIETTIVI = {
    Concessionario: ['Monitorare i prezzi della concorrenza', 'Valutare il mio parco usato', 'Alert su nuovi annunci e cali'],
    Commerciante:   ['Trovare affari sotto mercato', 'Valutare prima di rivendere', 'Alert su nuovi annunci e cali'],
    Privato:        ['Comprare al prezzo migliore', 'Valutare il mio usato', 'Alert sui cali di prezzo']
  };
  var QUESTIONS = ['Chi sei?', 'Cosa vuoi tenere d’occhio?', 'Cosa ti serve di più?'];

  var mount = document.getElementById('wizMount');
  var progress = document.getElementById('wizProgress');
  var answers = { role: null, tipo: null, obiettivo: null };
  var idx = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // Sposta il focus sull'heading del nuovo step (solo su azione utente).
  function focusHeading(h) {
    if (!h) return;
    h.setAttribute('tabindex', '-1');
    try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
  }
  function setProgress() { if (progress) progress.textContent = 'Passo ' + (idx + 1) + ' di 4'; }

  function optionsFor(i) {
    if (i === 0) return PROFILI;
    if (i === 1) return TIPI;
    return OBIETTIVI[answers.role] || [];   // Obiettivo guidato dal Profilo salvato
  }
  function store(i, label) {
    if (i === 0) answers.role = label;
    else if (i === 1) answers.tipo = label;
    else answers.obiettivo = label;
  }
  function backBtn() {
    var b = el('button', 'wiz-link', '‹ Indietro');
    b.type = 'button';
    b.addEventListener('click', function () { if (idx > 0) renderStep(idx - 1, true); });
    return b;
  }
  function waUrl() {
    var lines = [
      'Richiesta di accesso ad Auto Moto Radar.',
      'Profilo: ' + dot(answers.role || ''),
      'Veicoli: ' + dot(answers.tipo || ''),
      'Obiettivo: ' + dot(answers.obiettivo || '')
    ];
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function renderStep(i, focus) {
    if (!mount) return;
    idx = i;
    if (i >= 3) { renderRecap(focus); return; }
    mount.innerHTML = '';
    setProgress();
    var q = QUESTIONS[i];
    var h = el('h3', 'wiz-q', q); h.id = 'wizQ';
    mount.appendChild(h);
    var grp = el('div', 'wiz-options');
    grp.setAttribute('role', 'group');
    grp.setAttribute('aria-label', q);
    optionsFor(i).forEach(function (label) {
      var b = el('button', 'wiz-opt', label);
      b.type = 'button';
      b.addEventListener('click', function () { store(i, label); renderStep(i + 1, true); });
      grp.appendChild(b);
    });
    mount.appendChild(grp);
    if (i > 0) { var ctrls = el('div', 'wiz-controls'); ctrls.appendChild(backBtn()); mount.appendChild(ctrls); }
    if (focus) focusHeading(h);
  }

  function recapRow(k, v) {
    var r = el('div', 'wiz-recap-row');
    r.appendChild(el('span', 'wiz-recap-k', k));
    r.appendChild(el('span', 'wiz-recap-v', v || '—'));
    return r;
  }
  function renderRecap(focus) {
    if (!mount) return;
    idx = 3; setProgress();
    mount.innerHTML = '';
    var h = el('h3', 'wiz-q', 'Il tuo Auto Moto Radar'); h.id = 'wizQ';
    mount.appendChild(h);
    mount.appendChild(el('p', 'wiz-text', 'Ecco la configurazione che richiederai: la rifiniamo insieme su WhatsApp.'));
    var card = el('div', 'wiz-recap');
    card.appendChild(recapRow('Profilo', answers.role));
    card.appendChild(recapRow('Veicoli', answers.tipo));
    card.appendChild(recapRow('Obiettivo', answers.obiettivo));
    mount.appendChild(card);
    var a = document.createElement('a');
    a.className = 'btn btn-primary wiz-cta';
    a.href = waUrl(); a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'Richiedi accesso su WhatsApp';
    mount.appendChild(a);
    var ctrls = el('div', 'wiz-controls');
    ctrls.appendChild(backBtn());
    var restart = el('button', 'wiz-link', 'Ricomincia');
    restart.type = 'button';
    restart.addEventListener('click', function () { answers = { role: null, tipo: null, obiettivo: null }; renderStep(0, true); });
    ctrls.appendChild(restart);
    mount.appendChild(ctrls);
    if (focus) focusHeading(h);
  }

  function resetWizard() { answers = { role: null, tipo: null, obiettivo: null }; renderStep(0, true); }

  // Avvio: passo 1 senza rubare il focus.
  if (mount) renderStep(0, false);

  // ─── Modal "Richiedi accesso" (apre il wizard) ────────────────────────────────
  (function setupModal() {
    var modal = document.getElementById('accessModal');
    if (!modal) return;
    var card = modal.querySelector('.modal-card');
    var bgEls = [document.querySelector('header.topbar'), document.querySelector('main'), document.querySelector('footer.footer')];
    var lastTrigger = null;

    function focusables() {
      return Array.prototype.slice.call(card.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(function (el) { return el.offsetParent !== null; });
    }
    function open(trigger) {
      lastTrigger = trigger || null;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';                    // scroll lock
      bgEls.forEach(function (el) { if (el) el.inert = true; });   // resto inerte
      resetWizard();                                              // configuratore da capo + focus
    }
    function close() {
      modal.hidden = true;
      document.body.style.overflow = '';
      bgEls.forEach(function (el) { if (el) el.inert = false; });
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();  // ritorno focus
    }
    // Trigger: <a data-open-wizard> potenziati (senza JS → wa.me).
    Array.prototype.forEach.call(document.querySelectorAll('[data-open-wizard]'), function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); open(t); });
    });
    // Chiusura: backdrop + X.
    Array.prototype.forEach.call(modal.querySelectorAll('[data-close]'), function (c) {
      c.addEventListener('click', close);
    });
    // ESC + focus trap.
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  // ─── Funzioni: explorer a tab (pattern WAI-ARIA tabs) ─────────────────────────
  (function setupTabs() {
    var tablist = document.getElementById('fxTabs');
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.fx-tab'));
    var cap = document.getElementById('fxCap');
    var fxSelect = document.getElementById('fxSelect');   // nav alternativa su mobile
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var i = 0;

    function select(idx, focus) {
      i = (idx + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;                 // roving tabindex: solo l'attiva tabbabile
        if (panels[k]) panels[k].hidden = !on;    // pannelli inattivi fuori da tab/SR
      });
      if (cap) cap.textContent = tabs[i].getAttribute('data-desc') || '';
      if (fxSelect && fxSelect.selectedIndex !== i) fxSelect.selectedIndex = i;  // sync select↔tab
      if (focus) { tabs[i].focus(); tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    }

    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(k, false); });
    });
    if (fxSelect) {
      fxSelect.addEventListener('change', function () { select(parseInt(fxSelect.value, 10) || 0, false); });
    }
    tablist.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowDown': case 'ArrowRight': e.preventDefault(); select(i + 1, true); break;
        case 'ArrowUp':   case 'ArrowLeft':  e.preventDefault(); select(i - 1, true); break;
        case 'Home':                         e.preventDefault(); select(0, true); break;
        case 'End':                          e.preventDefault(); select(tabs.length - 1, true); break;
      }
    });

    select(0, false);
  })();

  // ─── Hero: demo "ricerca che si auto-digita" (solo se motion permesso) ────────
  (function heroDemo() {
    var q = document.getElementById('hdQuery');
    var aclist = document.getElementById('hdAclist');
    var auto = document.getElementById('hdAuto');
    var moto = document.getElementById('hdMoto');
    if (!q || !aclist || !auto || !moto) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // stato finale statico

    var SETS = [
      { brand: 'BMW',   model: 'BMW 320d Touring',  sugg: ['BMW 320d Touring', 'BMW 320i Sport', 'BMW 318d Business'], list: auto },
      { brand: 'Honda', model: 'Honda Africa Twin', sugg: ['Honda Africa Twin', 'Honda CB500X', 'Honda NC750X'],     list: moto }
    ];
    var t = null, si = 0;

    function buildList(sugg) {
      aclist.innerHTML = '';
      sugg.forEach(function (s, k) {
        var li = document.createElement('li');
        li.className = 'ac-item' + (k === 0 ? ' active' : '');
        li.textContent = s;
        aclist.appendChild(li);
      });
    }
    function showRows(list) {
      var rows = Array.prototype.slice.call(list.querySelectorAll('.result-row'));
      rows.forEach(function (r) { r.style.transition = 'none'; r.style.opacity = '0'; r.style.transform = 'translateY(6px)'; });
      list.hidden = false;
      (function reveal(i) {
        if (i >= rows.length) { t = setTimeout(nextSet, 3000); return; }
        rows[i].style.transition = 'opacity .28s ease, transform .28s ease';
        rows[i].style.opacity = '1'; rows[i].style.transform = 'none';
        t = setTimeout(function () { reveal(i + 1); }, 200);
      })(0);
    }
    function runSet() {
      var set = SETS[si];
      auto.hidden = true; moto.hidden = true;           // reset pulito
      aclist.hidden = true; aclist.innerHTML = '';
      q.textContent = '';
      (function type(i) {
        if (i <= set.brand.length) { q.textContent = set.brand.slice(0, i); t = setTimeout(function () { type(i + 1); }, 90); }
        else {
          buildList(set.sugg); aclist.hidden = false;    // compare il dropdown
          t = setTimeout(function () {
            aclist.hidden = true;                        // "seleziona" il modello evidenziato
            q.textContent = set.model;
            t = setTimeout(function () { showRows(set.list); }, 250);
          }, 950);
        }
      })(0);
    }
    function nextSet() { si = (si + 1) % SETS.length; runSet(); }

    runSet();   // un solo timer in catena (nessun accumulo)
  })();
})();
