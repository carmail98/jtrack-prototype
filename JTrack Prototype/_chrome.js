/* J-TRACK shared chrome: sidebar + topbar. Drop into any page with <div id="app-chrome" data-active="dashboard"></div> */
(function () {
  const NAV = [
    { group: 'Utama', items: [
      { key: 'dashboard', label: 'Dashboard', href: 'Dashboard.html', icon:
        '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
      { key: 'projek', label: 'Senarai Projek', href: 'Senarai Projek.html', icon:
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
      { key: 'intervensi', label: 'Intervensi', href: '#', icon:
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
      { key: 'laporan', label: 'Laporan', href: '#', icon:
        '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      { key: 'amaran', label: 'Amaran', href: '#', badge: 7, icon:
        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
    ]},
    { group: 'Pentadbiran', items: [
      { key: 'audit', label: 'Audit Log', href: '#', icon:
        '<path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/>' },
      { key: 'pengguna', label: 'Pengurusan Pengguna', href: 'Pengurusan Pengguna.html', icon:
        '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
      { key: 'tetapan', label: 'Tetapan', href: '#', icon:
        '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
    ]},
  ];

  function renderSidebar(active) {
    let html = `
      <aside class="w-60 bg-white border-r border-border flex flex-col flex-shrink-0">
        <div class="px-5 py-4 flex items-center gap-2.5 border-b border-border">
          <div class="w-9 h-9 rounded-md bg-orange flex items-center justify-center text-white font-bold text-[13px]">JT</div>
          <div>
            <div class="text-[14px] font-bold tracking-tight leading-none">J-TRACK</div>
            <div class="text-[10.5px] text-muted-foreground mt-0.5">JKR Malaysia</div>
          </div>
        </div>
        <nav class="flex-1 p-3 space-y-0.5 text-[13px] overflow-auto scrollbar">
    `;
    NAV.forEach(g => {
      html += `<div class="px-2 pt-2 pb-1 text-[10px] uppercase tracking-[1.5px] font-semibold text-muted-foreground">${g.group}</div>`;
      g.items.forEach(it => {
        const isActive = it.key === active;
        const cls = isActive
          ? 'bg-navy-50 text-navy-800 font-semibold'
          : 'text-slate-700 hover:bg-muted';
        const badge = it.badge ? `<span class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-critical text-white mono tabular">${it.badge}</span>` : '';
        html += `<a href="${it.href}" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md ${cls}">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${it.icon}</svg>
          <span>${it.label}</span>${badge}
        </a>`;
      });
    });
    html += `
        </nav>
        <div class="p-3 border-t border-border flex items-center gap-2.5">
          <div class="avatar w-8 h-8 rounded-full bg-navy text-[11px]">RA</div>
          <div class="min-w-0 flex-1">
            <div class="text-[12.5px] font-semibold truncate">Ir. Rafidah Ahmad</div>
            <div class="text-[11px] text-muted-foreground truncate">Pentadbir Sistem</div>
          </div>
          <button class="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Log keluar">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>
    `;
    return html;
  }

  function renderTopbar(crumbs) {
    const crumbHtml = crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      return isLast
        ? `<span class="text-foreground font-semibold">${c}</span>`
        : `<a class="hover:text-navy cursor-pointer">${c}</a><span>/</span>`;
    }).join('');
    return `
      <header class="jt-topbar h-14 bg-white border-b border-border px-6 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <button class="jt-hamburger p-1.5 -ml-1 rounded-md hover:bg-muted text-slate-700" aria-label="Menu">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          ${crumbHtml}
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <svg class="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Cari projek, pengguna, dokumen…" class="w-72 h-9 pl-8 pr-10 rounded-md border border-input bg-muted/60 text-[12.5px] field-focus"/>
            <span class="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-muted-foreground border border-border bg-white rounded px-1">⌘K</span>
          </div>
          <button class="p-2 rounded-md hover:bg-muted relative text-slate-600">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="absolute top-1 right-1 w-1.5 h-1.5 bg-critical rounded-full"></span>
          </button>
          <div class="flex items-center gap-1 rounded-md border border-border p-0.5">
            <button class="px-2 py-0.5 text-[10.5px] font-semibold rounded bg-navy text-white">BM</button>
            <button class="px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">EN</button>
          </div>
          <div class="avatar w-8 h-8 rounded-full bg-navy text-[11px] cursor-pointer">RA</div>
        </div>
      </header>
    `;
  }

  // =========================================================================
  // MOBILE RESPONSIVE LAYER — CSS overrides + sidebar drawer toggle
  // =========================================================================
  function injectMobileCSS() {
    if (document.getElementById('jt-mobile-css')) return;
    const style = document.createElement('style');
    style.id = 'jt-mobile-css';
    style.textContent = `
      /* Hamburger button — hidden on desktop, visible on mobile */
      .jt-hamburger { display: none; }

      @media (max-width: 767px) {
        /* ===== Page shell ===== */
        html, body { overflow-x: hidden; }
        .min-h-screen.flex { position: relative; }

        /* ===== Sidebar → Drawer ===== */
        aside.w-60 {
          position: fixed !important;
          top: 0; left: 0; bottom: 0;
          width: 260px !important;
          z-index: 45;
          transform: translateX(-100%);
          transition: transform 0.22s ease;
          box-shadow: 2px 0 24px rgba(0,0,0,0.22);
        }
        body.jt-drawer-open aside.w-60 { transform: translateX(0); }

        /* Backdrop */
        .jt-drawer-backdrop {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(19, 37, 62, 0.5);
          opacity: 0; pointer-events: none;
          transition: opacity 0.22s ease;
        }
        body.jt-drawer-open .jt-drawer-backdrop { opacity: 1; pointer-events: auto; }

        /* ===== Hamburger shown ===== */
        .jt-hamburger { display: inline-flex !important; }

        /* ===== Topbar ===== */
        header.jt-topbar { padding-left: 12px !important; padding-right: 12px !important; }
        /* Hide big desktop search input */
        header.jt-topbar > div:last-child > div.relative { display: none; }
        /* Hide BM/EN switcher on very narrow to save space */
        header.jt-topbar > div:last-child > div.flex.items-center.gap-1 { display: none; }

        /* ===== Main content ===== */
        main.flex-1 { overflow-x: hidden; }
        main section[class*="px-6"] {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        main section[class*="px-8"] {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }

        /* ===== Grid → stack on mobile ===== */
        .grid.grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .grid.grid-cols-3, .grid.grid-cols-2,
        .grid.grid-cols-5, .grid.grid-cols-6 {
          grid-template-columns: 1fr !important;
        }
        /* Responsive variants that lock wide layouts on small */
        [class*="md:grid-cols-"], [class*="lg:grid-cols-"], [class*="xl:grid-cols-"] {
          grid-template-columns: 1fr !important;
        }
        /* Tailwind arbitrary-value grids like grid-cols-[1fr_320px], [3fr_2fr] */
        [class*="grid-cols-["] {
          grid-template-columns: 1fr !important;
        }

        /* ===== Flex containers: allow wrap so cards don't overflow ===== */
        /* aggressive — every flex inside main wraps on mobile, EXCEPT small util
           flex groups (pill bars, icon rows) detected by no gap / small gap. */
        main .flex[class*="gap-"] { flex-wrap: wrap !important; }
        main .flex.items-start:not([class*="gap-1"]):not([class*="gap-2"]),
        main .flex.items-stretch { flex-wrap: wrap !important; }
        /* 2-column primary split (content + sidebar panel) → stack */
        main [class*="flex"][class*="gap-6"] > *,
        main [class*="flex"][class*="gap-8"] > * {
          flex: 1 1 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }
        /* Cards with fixed minimums force to full width */
        main [class*="min-w-"] { min-width: 0 !important; }
        /* Right-side panels (Amaran Terkini etc.) — common pattern */
        main [class*="w-80"], main [class*="w-[320px]"], main [class*="w-[300px]"],
        main [class*="w-96"], main [class*="w-72"] {
          width: 100% !important;
          max-width: 100% !important;
          flex-basis: 100% !important;
        }
        /* Cards that should keep vertical ordering — stack at the 1-col level */
        main .grid { gap: 0.75rem !important; }

        /* ===== Tables → horizontal scroll container ===== */
        main table { font-size: 11px !important; }
        main .overflow-auto, main .overflow-x-auto { -webkit-overflow-scrolling: touch; }

        /* ===== Fixed-width utilities → flex ===== */
        main [class*="w-72"], main [class*="w-80"], main [class*="w-96"] {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* ===== Headings: slightly smaller on mobile ===== */
        main h1 { font-size: 22px !important; line-height: 1.25 !important; }
        main h2 { font-size: 18px !important; }
        main .text-\\[26px\\] { font-size: 20px !important; }
        main .text-\\[22px\\] { font-size: 18px !important; }

        /* ===== Demo nav bar — shrink and tuck ===== */
        #jt-demo-nav {
          bottom: 12px !important;
          padding: 4px !important;
          gap: 2px !important;
          font-size: 11px !important;
          max-width: calc(100vw - 24px);
        }
        #jt-demo-nav a, #jt-demo-nav button { height: 30px !important; padding: 0 10px !important; }
        #jt-demo-nav .jt-dn-title { max-width: 110px !important; font-size: 11px !important; }
        #jt-demo-nav .jt-dn-home span { display: none !important; }
        #jt-demo-nav .jt-dn-home { padding: 0 8px !important; }
        #jt-demo-nav .jt-dn-step { min-width: 44px !important; font-size: 9.5px !important; }

        /* ===== Login / auth pages (full-bleed) ===== */
        body.jt-auth main > section,
        .min-h-screen.grid.grid-cols-2 { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function setupDrawer() {
    // Add backdrop element once
    if (!document.querySelector('.jt-drawer-backdrop')) {
      const bd = document.createElement('div');
      bd.className = 'jt-drawer-backdrop';
      bd.addEventListener('click', () => document.body.classList.remove('jt-drawer-open'));
      document.body.appendChild(bd);
    }
    // Wire up hamburger buttons (there may be multiple if topbar re-rendered)
    document.querySelectorAll('.jt-hamburger').forEach(btn => {
      if (btn.dataset.jtBound) return;
      btn.dataset.jtBound = '1';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.classList.toggle('jt-drawer-open');
      });
    });
    // Close drawer when clicking a sidebar link (so navigation feels right)
    document.querySelectorAll('aside.w-60 a').forEach(a => {
      if (a.dataset.jtBound) return;
      a.dataset.jtBound = '1';
      a.addEventListener('click', () => document.body.classList.remove('jt-drawer-open'));
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('jt-drawer-open')) {
        document.body.classList.remove('jt-drawer-open');
      }
    });
  }

  window.JTRACK = {
    mountChrome(active, crumbs) {
      const sb = document.getElementById('jt-sidebar');
      const tb = document.getElementById('jt-topbar');
      if (sb) sb.outerHTML = renderSidebar(active);
      if (tb) tb.outerHTML = renderTopbar(crumbs || []);
      // Re-bind after re-render
      setupDrawer();
    }
  };

  // Inject mobile CSS immediately and wire drawer once DOM ready
  injectMobileCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDrawer);
  } else {
    setupDrawer();
  }

  // =========================================================================
  // DEMO NAV BAR — floating pill with Prev/Next/Navigator + keyboard shortcuts
  // Auto-injects on every prototype page (except demo.html itself).
  // Order matches the demo flow recommended for JKR 27 Apr 2026 presentation.
  // =========================================================================
  const DEMO_FLOW = [
    ['Log Masuk.html',                'Log Masuk'],
    ['Daftar Akaun.html',             'Daftar Akaun'],
    ['Pengesahan Emel.html',          'Pengesahan Emel'],
    ['Profil Pengguna.html',          'Profil Pengguna'],
    ['Dashboard.html',                'Dashboard'],
    ['Senarai Projek.html',           'Senarai Projek'],
    ['Detail Projek.html',            'Detail Projek'],
    ['Pilih Projek.html',             'Pilih Projek'],
    ['Modal Kunci Maklumat.html',     'Modal Kunci Maklumat'],
    ['Pra-Intervensi.html',           'Pra-Intervensi'],
    ['Tarikh Intervensi.html',        'Tarikh Intervensi'],
    ['Tetapkan Pasukan.html',         'Tetapkan Pasukan'],
    ['Tindakan Pengesyoran.html',     'Tindakan Pengesyoran'],
    ['Laporan Intervensi.html',       'Laporan Intervensi'],
    ['Laporan Intervensi Form.html',  'Laporan Intervensi (Borang)'],
    ['Semakan Pengesah.html',         'Semakan Pengesah'],
    ['Muktamadkan Laporan.html',      'Muktamadkan Laporan'],
    ['Laporan Diluluskan.html',       'Laporan Diluluskan'],
    ['Jana Surat.html',               'Jana Surat'],
    ['Ruang Catatan.html',            'Ruang Catatan'],
    ['Penilaian Prestasi.html',       'Penilaian Prestasi'],
    ['Mesyuarat Penutup.html',        'Mesyuarat Penutup'],
    ['Workflow Visualizer.html',      'Workflow Visualizer'],
    ['Pusat Amaran.html',             'Pusat Amaran'],
    ['Email Notification.html',       'Email Notification'],
    ['Laporan Kemajuan Bulanan.html', 'Laporan Kemajuan Bulanan'],
    ['Log Audit.html',                'Log Jejak Audit'],
    ['Pengurusan Pengguna.html',      'Pengurusan Pengguna'],
  ];

  function injectDemoNav() {
    try {
      const path = decodeURIComponent((location.pathname.split('/').pop() || '').replace(/^\/+/, ''));
      // skip on demo navigator itself or empty
      if (!path || path === 'demo.html' || path === 'index.html') return;
      const idx = DEMO_FLOW.findIndex(([f]) => f === path);
      if (idx === -1) return;  // page not in demo flow

      const total = DEMO_FLOW.length;
      const prev = idx > 0 ? DEMO_FLOW[idx - 1] : null;
      const next = idx < total - 1 ? DEMO_FLOW[idx + 1] : null;
      const cur  = DEMO_FLOW[idx];

      const bar = document.createElement('div');
      bar.id = 'jt-demo-nav';
      bar.innerHTML = `
        <style>
          #jt-demo-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            z-index: 9999; display: flex; align-items: center; gap: 4px;
            background: #13253E; color: #fff; border-radius: 999px; padding: 6px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.08);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Arial, sans-serif;
            font-size: 12px; user-select: none;
            transition: opacity 0.2s ease;
          }
          #jt-demo-nav.jt-hidden { opacity: 0.15; }
          #jt-demo-nav.jt-hidden:hover { opacity: 1; }
          #jt-demo-nav a, #jt-demo-nav button {
            display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px;
            color: inherit; text-decoration: none; border-radius: 999px;
            background: transparent; border: 0; cursor: pointer; font: inherit;
            transition: background 0.12s ease;
          }
          #jt-demo-nav a:hover, #jt-demo-nav button:hover { background: rgba(255,255,255,0.08); }
          #jt-demo-nav .jt-dn-home { background: #D4A017; color: #13253E; font-weight: 600; }
          #jt-demo-nav .jt-dn-home:hover { background: #F2C94C; }
          #jt-demo-nav .jt-dn-step { padding: 0 10px; color: rgba(255,255,255,0.6);
            font-family: "JetBrains Mono", ui-monospace, "SFMono-Regular", "Consolas", monospace;
            font-size: 10.5px; letter-spacing: 0.5px; min-width: 58px; text-align: center;
          }
          #jt-demo-nav .jt-dn-title { font-weight: 600; white-space: nowrap; max-width: 260px;
            overflow: hidden; text-overflow: ellipsis;
          }
          #jt-demo-nav .jt-dn-disabled { opacity: 0.28; pointer-events: none; }
          #jt-demo-nav svg { width: 14px; height: 14px; flex-shrink: 0; }
          #jt-demo-nav .jt-dn-kbd { font-family: "JetBrains Mono", monospace; font-size: 9.5px;
            padding: 1px 4px; border-radius: 4px; background: rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.72); margin-left: 6px;
          }
          @media print { #jt-demo-nav { display: none !important; } }
        </style>
        <a class="jt-dn-home" href="demo.html" title="Kembali ke Demo Navigator (Esc)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span>Navigator</span>
        </a>
        <a class="${prev ? '' : 'jt-dn-disabled'}" href="${prev ? encodeURI(prev[0]) : '#'}" title="Sebelum (←)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </a>
        <span class="jt-dn-step">${String(idx + 1).padStart(2,'0')} / ${total}</span>
        <span class="jt-dn-title">${cur[1]}</span>
        <a class="${next ? '' : 'jt-dn-disabled'}" href="${next ? encodeURI(next[0]) : '#'}" title="Seterusnya (→)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
        <button id="jt-dn-toggle" title="Sorok / Paparkan (H)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      `;
      document.body.appendChild(bar);

      // toggle hide/show
      document.getElementById('jt-dn-toggle').addEventListener('click', () => {
        bar.classList.toggle('jt-hidden');
      });

      // keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // ignore when typing in input/textarea/contenteditable
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (e.key === 'ArrowLeft' && prev)  { e.preventDefault(); location.href = encodeURI(prev[0]); }
        if (e.key === 'ArrowRight' && next) { e.preventDefault(); location.href = encodeURI(next[0]); }
        if (e.key === 'Escape')             { e.preventDefault(); location.href = 'demo.html'; }
        if (e.key === 'h' || e.key === 'H') { bar.classList.toggle('jt-hidden'); }
      });
    } catch (err) {
      // never break the page because of demo nav
      console && console.warn && console.warn('demo-nav inject failed', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDemoNav);
  } else {
    injectDemoNav();
  }
})();
