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
      <header class="h-14 bg-white border-b border-border px-6 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2 text-[12.5px] text-muted-foreground">${crumbHtml}</div>
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

  window.JTRACK = {
    mountChrome(active, crumbs) {
      const sb = document.getElementById('jt-sidebar');
      const tb = document.getElementById('jt-topbar');
      if (sb) sb.outerHTML = renderSidebar(active);
      if (tb) tb.outerHTML = renderTopbar(crumbs || []);
    }
  };
})();
