/* J-TRACK shared actions module
 * ================================
 * Provides:
 *  - Toast notifications (success / info / warning / error)
 *  - localStorage state management (login session, drafts, workflow, audit log)
 *  - Workflow state machine following Garis Panduan Intervensi JKR (Jun 2021):
 *      Fasa 1 Perancangan → Fasa 2 Pelaksanaan → Fasa 3 Pelaporan → Fasa 4 Pasca
 *  - Auto-wiring of common buttons by data-action attribute or text content
 *  - Audit log auto-append on every state change
 *
 * Drop into any page; the IIFE attaches global handlers.
 */
(function () {
  'use strict';

  // ===========================================================================
  // STORAGE — namespaced wrapper around localStorage
  // ===========================================================================
  const NS = 'jtrack:';
  const Store = {
    get(key, def = null) {
      try {
        const raw = localStorage.getItem(NS + key);
        return raw === null ? def : JSON.parse(raw);
      } catch { return def; }
    },
    set(key, val) {
      try { localStorage.setItem(NS + key, JSON.stringify(val)); } catch {}
    },
    remove(key) { try { localStorage.removeItem(NS + key); } catch {} },
  };

  // ===========================================================================
  // SESSION
  // ===========================================================================
  const Session = {
    user: () => Store.get('session', null),
    login(profile) {
      Store.set('session', {
        ...profile,
        loggedInAt: new Date().toISOString(),
      });
      Audit.log('Log Masuk', `${profile.nama} log masuk sistem`, profile);
    },
    logout() {
      const u = Session.user();
      if (u) Audit.log('Log Keluar', `${u.nama} log keluar sistem`, u);
      Store.remove('session');
    },
  };

  // ===========================================================================
  // AUDIT LOG (immutable append-only)
  // ===========================================================================
  const Audit = {
    log(action, description, meta = {}) {
      const entries = Store.get('audit', []);
      entries.unshift({
        id: `LOG-${Date.now()}`,
        ts: new Date().toISOString(),
        action,
        description,
        actor: (Session.user() && Session.user().nama) || 'Sistem',
        meta,
      });
      // Keep last 200 entries
      Store.set('audit', entries.slice(0, 200));
    },
    all: () => Store.get('audit', []),
  };

  // ===========================================================================
  // WORKFLOW — Garis Panduan Intervensi JKR (4 Fasa)
  // ===========================================================================
  const FASA = {
    1: { name: 'Perancangan', short: 'F1' },
    2: { name: 'Pelaksanaan', short: 'F2' },
    3: { name: 'Pelaporan', short: 'F3' },
    4: { name: 'Pasca-Intervensi', short: 'F4' },
  };

  const Workflow = {
    state(projekId = 'PRJ-N9-2024-0042') {
      return Store.get(`projek:${projekId}`, {
        projekId,
        fasa: 1,
        status: 'Aktif',
        history: [],
        pasukanLantik: false,
        suratLantikan: null,
        suratEdaran: null,
        laporanStatus: 'draf', // draf | semakan | diluluskan
        laporanBulanan: 0, // count of monthly reports submitted in Fasa 4
      });
    },
    save(state) {
      Store.set(`projek:${state.projekId}`, state);
    },
    advance(projekId, toFasa, action, description) {
      const s = Workflow.state(projekId);
      const from = s.fasa;
      s.history.push({ from, to: toFasa, action, ts: new Date().toISOString() });
      s.fasa = toFasa;
      Workflow.save(s);
      Audit.log(action, description, { projekId, from: `Fasa ${from}`, to: `Fasa ${toFasa}` });
    },
  };

  // ===========================================================================
  // TOAST NOTIFICATIONS
  // ===========================================================================
  function ensureToastContainer() {
    let c = document.getElementById('jt-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'jt-toast-container';
      c.style.cssText = `
        position: fixed; bottom: 80px; right: 24px; z-index: 9998;
        display: flex; flex-direction: column; gap: 8px; pointer-events: none;
      `;
      document.body.appendChild(c);
    }
    return c;
  }

  function injectToastStyles() {
    if (document.getElementById('jt-toast-css')) return;
    const s = document.createElement('style');
    s.id = 'jt-toast-css';
    s.textContent = `
      .jt-toast {
        pointer-events: auto;
        min-width: 280px; max-width: 420px;
        padding: 12px 16px; border-radius: 10px;
        background: #FFFFFF; border: 1px solid #E5E7EB;
        box-shadow: 0 8px 24px rgba(19,37,62,0.18), 0 0 0 1px rgba(19,37,62,0.04);
        display: flex; align-items: flex-start; gap: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif;
        font-size: 13px; color: #1A1A2E;
        animation: jt-toast-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2);
      }
      .jt-toast.jt-out { animation: jt-toast-out 0.18s ease-in forwards; }
      @keyframes jt-toast-in {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes jt-toast-out {
        to { transform: translateX(20px); opacity: 0; }
      }
      .jt-toast-icon {
        width: 20px; height: 20px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        border-radius: 999px; font-size: 11px; font-weight: 700; color: white;
      }
      .jt-toast.success .jt-toast-icon { background: #2E7D5B; }
      .jt-toast.info    .jt-toast-icon { background: #1E3A5F; }
      .jt-toast.warning .jt-toast-icon { background: #D4A017; color: #1A1A2E; }
      .jt-toast.error   .jt-toast-icon { background: #C7561D; }
      .jt-toast-body { flex: 1; min-width: 0; }
      .jt-toast-title { font-weight: 600; line-height: 1.3; }
      .jt-toast-desc { font-size: 12px; color: #5A6B7E; margin-top: 2px; }
    `;
    document.head.appendChild(s);
  }

  function toast(opts) {
    injectToastStyles();
    const c = ensureToastContainer();
    const t = document.createElement('div');
    const type = opts.type || 'info';
    const icon = { success: '✓', info: 'i', warning: '!', error: '×' }[type] || 'i';
    t.className = `jt-toast ${type}`;
    t.innerHTML = `
      <div class="jt-toast-icon">${icon}</div>
      <div class="jt-toast-body">
        <div class="jt-toast-title">${opts.title || ''}</div>
        ${opts.desc ? `<div class="jt-toast-desc">${opts.desc}</div>` : ''}
      </div>
    `;
    c.appendChild(t);
    setTimeout(() => {
      t.classList.add('jt-out');
      setTimeout(() => t.remove(), 200);
    }, opts.duration || 3500);
  }

  // ===========================================================================
  // ACTION HANDLERS — match by data-action attribute or button text
  // ===========================================================================
  const ACTIONS = {
    // Authentication
    'login': () => {
      Session.login({
        nama: 'Ir. Rafidah Ahmad',
        peranan: 'Pentadbir Sistem',
        cawangan: 'CPAB Ibu Pejabat',
        avatar: 'RA',
      });
      toast({ type: 'success', title: 'Log masuk berjaya', desc: 'Mengalihkan ke Dashboard…' });
      setTimeout(() => location.href = 'Dashboard.html', 800);
    },
    'logout': () => {
      Session.logout();
      toast({ type: 'info', title: 'Log keluar berjaya', desc: 'Sila log masuk semula untuk teruskan.' });
      setTimeout(() => location.href = 'Log Masuk.html', 800);
    },
    'register': () => {
      toast({ type: 'success', title: 'Pendaftaran dihantar', desc: 'Sila semak emel anda untuk pengesahan.' });
      setTimeout(() => location.href = 'Pengesahan Emel.html', 1000);
    },
    'verify-email': () => {
      toast({ type: 'success', title: 'Emel disahkan', desc: 'Akaun anda telah aktif.' });
      setTimeout(() => location.href = 'Log Masuk.html', 1000);
    },

    // Common form actions
    'save-draft': () => {
      toast({ type: 'success', title: 'Draf disimpan', desc: 'Auto-save aktif.' });
      Audit.log('Simpan Draf', 'Draf dokumen disimpan');
    },
    'save': () => {
      toast({ type: 'success', title: 'Tersimpan', desc: 'Perubahan disimpan ke pangkalan data.' });
      Audit.log('Simpan', 'Data disimpan');
    },
    'cancel': () => {
      if (confirm('Buang perubahan? Tindakan ini tidak boleh dibuat asal.')) {
        history.length > 1 ? history.back() : (location.href = 'Dashboard.html');
      }
    },

    // Fasa 1 — Perancangan
    'daftar-psg': () => {
      Workflow.advance('PRJ-N9-2024-0042', 1, 'Daftar PSG',
        'Projek didaftarkan sebagai Projek Sakit/Bermasalah');
      toast({ type: 'success', title: 'Projek didaftar sebagai PSG', desc: 'Fasa 1: Perancangan dimulakan.' });
      setTimeout(() => location.href = 'Pra-Intervensi.html', 800);
    },
    'sahkan-tarikh': () => {
      toast({ type: 'success', title: 'Tarikh intervensi disahkan', desc: 'Notifikasi dihantar kepada pasukan.' });
      Audit.log('Sahkan Tarikh', 'Tarikh intervensi ditetapkan');
      setTimeout(() => location.href = 'Tetapkan Pasukan.html', 800);
    },
    'lantik-pasukan': () => {
      const s = Workflow.state();
      s.pasukanLantik = true;
      Workflow.save(s);
      toast({ type: 'success', title: 'Pasukan dilantik', desc: 'Surat Lantikan (Appendix A) sedang dijana…' });
      Audit.log('Lantik Pasukan', 'Ketua Pasukan dan ahli dilantik');
      setTimeout(() => location.href = 'Jana Surat.html', 1000);
    },
    'jana-surat-lantikan': () => {
      const s = Workflow.state();
      s.suratLantikan = `LANT-${Date.now()}`;
      Workflow.save(s);
      Workflow.advance('PRJ-N9-2024-0042', 2, 'Jana Surat Lantikan',
        'Surat Lantikan Pasukan Intervensi (Appendix A) dijana');
      toast({ type: 'success', title: 'Surat Lantikan dijana', desc: 'Templat Appendix A — siap untuk diedarkan. Fasa 2 dimulakan.' });
    },

    // Fasa 2 — Pelaksanaan
    'rekod-lawatan': () => {
      toast({ type: 'success', title: 'Lawatan tapak direkod', desc: 'Borang Penilaian (Appendix C) sedia untuk diisi.' });
      Audit.log('Lawatan Tapak', 'Lawatan tapak direkodkan');
    },
    'hantar-pengesyoran': () => {
      Workflow.advance('PRJ-N9-2024-0042', 3, 'Hantar Pengesyoran',
        'Pengesyoran tindakan dihantar — Fasa 3 Pelaporan dimulakan');
      toast({ type: 'success', title: 'Pengesyoran dihantar', desc: 'Sila sediakan Laporan Intervensi (Appendix D).' });
      setTimeout(() => location.href = 'Laporan Intervensi Form.html', 1000);
    },

    // Fasa 3 — Pelaporan
    'hantar-semakan': () => {
      const s = Workflow.state();
      s.laporanStatus = 'semakan';
      Workflow.save(s);
      // Advance F2 (Pelaksanaan) -> F3 (Pelaporan) — submission of Borang Penilaian
      // marks transition from site-execution phase to reporting phase per Garis Panduan
      if (s.fasa === 2) {
        Workflow.advance('PRJ-N9-2024-0042', 3, 'Hantar Semakan',
          'Borang Penilaian dihantar — Fasa 3 Pelaporan dimulakan · Pengesah dimaklumkan');
      } else {
        Audit.log('Hantar Semakan', 'Laporan Intervensi dihantar untuk semakan Pengesah');
      }
      toast({ type: 'success', title: 'Laporan dihantar untuk semakan', desc: 'Pengesah akan dimaklumkan. Fasa 3 Pelaporan dimulakan.' });
      setTimeout(() => location.href = 'Semakan Pengesah.html', 1000);
    },
    'lulus-laporan': () => {
      const s = Workflow.state();
      s.laporanStatus = 'diluluskan';
      Workflow.save(s);
      Audit.log('Lulus Laporan', 'Laporan Intervensi diluluskan oleh Pengesah');
      toast({ type: 'success', title: 'Laporan diluluskan', desc: 'Boleh diteruskan ke muktamadkan.' });
      setTimeout(() => location.href = 'Muktamadkan Laporan.html', 1000);
    },
    'tolak-laporan': () => {
      const c = prompt('Catatan tolakan untuk Pasukan Intervensi:');
      if (!c) return;
      const s = Workflow.state();
      s.laporanStatus = 'draf';
      Workflow.save(s);
      Audit.log('Tolak Laporan', `Laporan ditolak: ${c}`);
      toast({ type: 'warning', title: 'Laporan ditolak', desc: 'Catatan dihantar kepada Pasukan Intervensi.' });
      setTimeout(() => location.href = 'Laporan Intervensi Form.html', 1200);
    },
    'muktamadkan-laporan': () => {
      Audit.log('Muktamadkan Laporan', 'Laporan Intervensi dimuktamadkan dan immutable');
      toast({ type: 'success', title: 'Laporan dimuktamadkan', desc: 'Rekod kini immutable dalam audit log.' });
      setTimeout(() => location.href = 'Laporan Diluluskan.html', 1000);
    },
    'jana-surat-edaran': () => {
      const s = Workflow.state();
      s.suratEdaran = `EDR-${Date.now()}`;
      Workflow.save(s);
      // Always advance to Fasa 4 from current — guard against earlier-fasa skip
      const target = Math.max(s.fasa + 1, 4);
      Workflow.advance('PRJ-N9-2024-0042', 4, 'Jana Surat Edaran',
        `Surat Edaran (Appendix E) dijana — transit Fasa ${s.fasa} → Fasa 4 Pasca-Intervensi`);
      toast({ type: 'success', title: 'Surat Edaran dijana', desc: 'Templat Appendix E — salinan auto ke CPAB Ibu Pejabat. Fasa 4 dimulakan.' });
      setTimeout(() => location.href = 'Ruang Catatan.html', 1200);
    },

    // Fasa 4 — Pasca
    'hantar-laporan-bulanan': () => {
      const s = Workflow.state();
      s.laporanBulanan = (s.laporanBulanan || 0) + 1;
      Workflow.save(s);
      Audit.log('Laporan Kemajuan', `Laporan kemajuan bulanan ${s.laporanBulanan}/3 dihantar`);
      if (s.laporanBulanan >= 3) {
        toast({ type: 'success', title: 'Laporan Bulanan ke-3 diterima', desc: '3 bulan berturut-turut tercapai. Boleh tutup PSG.' });
      } else {
        toast({ type: 'success', title: `Laporan bulanan ${s.laporanBulanan}/3 dihantar`, desc: 'Pemantauan diteruskan.' });
      }
    },
    'tutup-psg': () => {
      const s = Workflow.state();
      if ((s.laporanBulanan || 0) < 3) {
        toast({ type: 'warning', title: 'Belum boleh ditutup', desc: 'Memerlukan 3 laporan kemajuan bulanan berturut-turut.' });
        return;
      }
      s.status = 'Tamat';
      Workflow.save(s);
      Audit.log('Tutup PSG', 'Status PSG ditutup — pemulihan diperakui');
      toast({ type: 'success', title: 'PSG ditutup', desc: 'Status pemulihan diperakui. Mesyuarat penutup dirancang.' });
      setTimeout(() => location.href = 'Mesyuarat Penutup.html', 1200);
    },

    // Eksport
    'eksport-pdf': () => {
      toast({ type: 'info', title: 'Eksport PDF', desc: 'Sedang menjana fail PDF…' });
      setTimeout(() => toast({ type: 'success', title: 'PDF dijana', desc: 'Muat turun bermula.' }), 1500);
      Audit.log('Eksport PDF', 'Dokumen dieksport ke PDF');
    },
    'eksport-excel': () => {
      toast({ type: 'info', title: 'Eksport Excel', desc: 'Sedang menjana fail Excel…' });
      setTimeout(() => toast({ type: 'success', title: 'Excel dijana', desc: 'Muat turun bermula.' }), 1500);
      Audit.log('Eksport Excel', 'Data dieksport ke Excel');
    },
    'cetak': () => {
      window.print();
    },

    // Generic next/prev/cancel
    'next': () => toast({ type: 'info', title: 'Langkah seterusnya', desc: 'Mengalihkan…' }),
    'tandakan-baca': () => {
      toast({ type: 'success', title: 'Semua amaran ditandakan dibaca' });
      document.querySelectorAll('[data-unread]').forEach(el => el.removeAttribute('data-unread'));
    },
  };

  // Map common button text to an action when no data-action attribute set
  const TEXT_MAP = [
    [/^log\s*masuk/i, 'login'],          // also catches "Log Masuk dengan Akaun (JDN)"
    [/log\s*keluar/i, 'logout'],
    [/^daftar/i, 'register'],
    [/sahkan\s+emel/i, 'verify-email'],
    [/^simpan\s+draf$/i, 'save-draft'],
    [/^simpan$/i, 'save'],
    [/^batal$/i, 'cancel'],
    [/jana.*surat.*lantikan/i, 'jana-surat-lantikan'],
    [/jana.*surat.*edaran/i, 'jana-surat-edaran'],
    [/jana.*surat/i, 'jana-surat-edaran'],
    [/hantar.*semakan/i, 'hantar-semakan'],
    [/hantar.*pengesyoran/i, 'hantar-pengesyoran'],
    [/hantar.*laporan.*bulanan/i, 'hantar-laporan-bulanan'],
    [/^lulus(kan)?$/i, 'lulus-laporan'],
    [/^tolak$/i, 'tolak-laporan'],
    [/muktamadkan/i, 'muktamadkan-laporan'],
    [/tutup.*psg/i, 'tutup-psg'],
    [/eksport.*pdf/i, 'eksport-pdf'],
    [/eksport.*excel/i, 'eksport-excel'],
    [/^cetak$/i, 'cetak'],
    [/lantik.*pasukan/i, 'lantik-pasukan'],
    [/sahkan.*tarikh/i, 'sahkan-tarikh'],
    [/daftar.*psg/i, 'daftar-psg'],
    [/rekod.*lawatan/i, 'rekod-lawatan'],
    [/tandakan.*baca/i, 'tandakan-baca'],
  ];

  function resolveAction(el) {
    if (el.dataset && el.dataset.action) return el.dataset.action;
    const txt = (el.textContent || '').trim();
    if (!txt) return null;
    for (const [re, action] of TEXT_MAP) if (re.test(txt)) return action;
    return null;
  }

  // ===========================================================================
  // EVENT WIRING — single delegated click listener
  // ===========================================================================
  document.addEventListener('click', (e) => {
    let el = e.target;
    while (el && el !== document.body) {
      if (el.tagName === 'BUTTON' || el.tagName === 'A') break;
      el = el.parentElement;
    }
    if (!el || el === document.body) return;
    // Skip if button has explicit href (navigation already handled by browser)
    if (el.tagName === 'A' && el.getAttribute('href') &&
        el.getAttribute('href') !== '#' && !el.dataset.action) {
      return;
    }
    const action = resolveAction(el);
    if (!action || !ACTIONS[action]) return;
    e.preventDefault();
    ACTIONS[action]();
  });

  // ===========================================================================
  // FORM AUTO-SAVE — every input persists to localStorage
  // ===========================================================================
  function bindFormAutoSave() {
    const formKey = 'form:' + (location.pathname.split('/').pop() || 'home');
    const saved = Store.get(formKey, {});
    document.querySelectorAll('input, textarea, select').forEach((el, i) => {
      const k = el.id || el.name || `field_${i}`;
      // Restore
      if (saved[k] !== undefined) {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = saved[k];
        else el.value = saved[k];
      }
      // Save on change
      el.addEventListener('change', () => {
        const cur = Store.get(formKey, {});
        cur[k] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
        Store.set(formKey, cur);
      });
    });
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================
  window.JT = {
    Session, Audit, Workflow, Store, FASA,
    toast, action: ACTIONS,
  };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindFormAutoSave);
  } else {
    bindFormAutoSave();
  }
})();
