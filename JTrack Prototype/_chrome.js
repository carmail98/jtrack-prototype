/* J-TRACK shared chrome v2.0 — sidebar + topbar + RBAC role switcher + auto-wire engine.
   Drop into any page with <div id="jt-sidebar"></div><div id="jt-topbar"></div>
   then call JTRACK.mountChrome('<active-key>', ['Crumb 1','Crumb 2']);
*/
(function () {

  // =========================================================================
  // RBAC — 5-tier roles (selaras Garis Panduan Intervensi JKR)
  // =========================================================================
  const ROLES = {
    admin: {
      key: 'admin',
      name: 'Ir. Rafidah Ahmad',
      jawatan: 'Pentadbir Sistem · CPAB Ibu Pejabat',
      gred: 'JUSA C',
      initials: 'RA',
      bg: '#13253E',
      tier: 'Admin',
      desc: 'Akses penuh: master data, lantik pasukan, semua laporan, RBAC, audit',
      hideMenu: [],
      hideAction: [],
    },
    penyedia: {
      key: 'penyedia',
      name: 'En. Hafiz bin Ismail',
      jawatan: 'Ketua Pasukan Intervensi · CPAB',
      gred: 'J52',
      initials: 'HI',
      bg: '#1E3A5F',
      tier: 'Penyedia Laporan',
      desc: 'Input data, isi Borang Penilaian, sediakan Laporan Intervensi',
      hideMenu: ['pengguna'],
      hideAction: [],
    },
    pengesah: {
      key: 'pengesah',
      name: 'Ir. Rosli bin Mahmud',
      jawatan: 'Pengarah Projek · Pegawai Penguasa',
      gred: 'J54',
      initials: 'RM',
      bg: '#0e7490',
      tier: 'Pengesah',
      desc: 'Sahkan/tolak laporan sebelum edaran rasmi',
      hideMenu: ['pengguna'],
      hideAction: ['projek-baharu'],
    },
    pengguna: {
      key: 'pengguna',
      name: 'Pn. Aishah binti Razak',
      jawatan: 'Pengurus Projek · HOPT',
      gred: 'J48',
      initials: 'AR',
      bg: '#7c3aed',
      tier: 'Pengguna Biasa',
      desc: 'Hantar laporan kemajuan, kemaskini status tapak',
      hideMenu: ['pengguna', 'audit'],
      hideAction: ['projek-baharu', 'sahkan'],
    },
    viewer: {
      key: 'viewer',
      name: 'YBhg. Datuk Idris bin Othman',
      jawatan: 'Pengurusan Atasan · ICU JPM',
      gred: 'JUSA A',
      initials: 'IO',
      bg: '#475569',
      tier: 'Viewer',
      desc: 'Read-only — dashboard pemantauan strategik',
      hideMenu: ['pengguna', 'intervensi'],
      hideAction: ['projek-baharu', 'sahkan', 'tindakan', 'eksport'],
      readOnly: true,
    },
  };

  function getRole() {
    try {
      const k = localStorage.getItem('jtrack.role') || 'admin';
      return ROLES[k] || ROLES.admin;
    } catch (e) { return ROLES.admin; }
  }

  function setRole(k) {
    try { localStorage.setItem('jtrack.role', k); } catch (e) {}
    location.reload();
  }

  // =========================================================================
  // NAVIGATION DEFINITIONS
  // =========================================================================
  const NAV = [
    { group: 'Utama', items: [
      { key: 'dashboard', label: 'Dashboard', href: 'Dashboard.html', icon:
        '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
      { key: 'projek', label: 'Senarai Projek', href: 'Senarai Projek.html', icon:
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
      { key: 'intervensi', label: 'Intervensi', href: 'Pra-Intervensi.html', icon:
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
      { key: 'borang', label: 'Borang Penilaian', href: 'Borang Penilaian.html', icon:
        '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
      { key: 'laporan', label: 'Laporan', href: 'Laporan Diluluskan.html', icon:
        '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      { key: 'surat', label: 'Surat Rasmi', href: 'Jana Surat.html', icon:
        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' },
      { key: 'susulan', label: 'Susulan Bulanan', href: 'Susulan Bulanan.html', icon:
        '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>' },
      { key: 'amaran', label: 'Amaran', href: 'Pusat Amaran.html', badge: 7, icon:
        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
    ]},
    { group: 'Pentadbiran', items: [
      { key: 'audit', label: 'Audit Log', href: 'Log Audit.html', icon:
        '<path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/>' },
      { key: 'pengguna', label: 'Pengurusan Pengguna', href: 'Pengurusan Pengguna.html', icon:
        '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
      { key: 'tetapan', label: 'Tetapan', href: 'Profil Pengguna.html', icon:
        '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
    ]},
  ];

  // =========================================================================
  // SIDEBAR (with role-aware filtering)
  // =========================================================================
  function renderSidebar(active) {
    const role = getRole();
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
      // Hide whole group if all items are hidden for this role
      const visibleItems = g.items.filter(it => !role.hideMenu.includes(it.key));
      if (visibleItems.length === 0) return;
      html += `<div class="px-2 pt-2 pb-1 text-[10px] uppercase tracking-[1.5px] font-semibold text-muted-foreground">${g.group}</div>`;
      visibleItems.forEach(it => {
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
        <div class="p-3 border-t border-border">
          <div class="text-[9.5px] uppercase tracking-[1.5px] font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
            <span>Demo sebagai</span>
            <button id="jt-role-info" class="text-muted-foreground hover:text-navy" title="Info tentang RBAC">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
            </button>
          </div>
          <button id="jt-role-switcher" class="w-full flex items-center gap-2.5 p-2 -m-2 rounded-md hover:bg-muted text-left">
            <div class="avatar w-8 h-8 rounded-full text-[11px]" style="background:${role.bg}">${role.initials}</div>
            <div class="min-w-0 flex-1">
              <div class="text-[12px] font-semibold truncate">${role.name}</div>
              <div class="text-[10.5px] text-muted-foreground truncate">${role.tier} · ${role.gred}</div>
            </div>
            <svg class="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </aside>
    `;
    return html;
  }

  // =========================================================================
  // TOPBAR
  // =========================================================================
  function renderTopbar(crumbs) {
    const role = getRole();
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
            <input id="jt-search" placeholder="Cari projek, pengguna, dokumen…" class="w-72 h-9 pl-8 pr-10 rounded-md border border-input bg-muted/60 text-[12.5px] field-focus"/>
            <span class="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-muted-foreground border border-border bg-white rounded px-1">⌘K</span>
          </div>
          <button id="jt-notif-btn" class="p-2 rounded-md hover:bg-muted relative text-slate-600" title="Pusat Amaran">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="absolute top-1 right-1 w-1.5 h-1.5 bg-critical rounded-full"></span>
          </button>
          <div class="flex items-center gap-1 rounded-md border border-border p-0.5">
            <button class="px-2 py-0.5 text-[10.5px] font-semibold rounded bg-navy text-white">BM</button>
            <button class="px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground hover:bg-muted rounded">EN</button>
          </div>
          <button id="jt-topbar-avatar" class="avatar w-8 h-8 rounded-full text-[11px] cursor-pointer" style="background:${role.bg}" title="${role.name} (${role.tier})">${role.initials}</button>
        </div>
      </header>
    `;
  }

  // =========================================================================
  // ROLE SWITCHER MODAL
  // =========================================================================
  function showRoleSwitcher() {
    const cur = getRole();
    const cards = Object.values(ROLES).map(r => `
      <button data-role="${r.key}" class="jt-role-card w-full text-left p-4 rounded-lg border-2 ${r.key === cur.key ? 'border-navy bg-navy-50/30' : 'border-border hover:border-navy/50 hover:bg-muted/30'} transition">
        <div class="flex items-start gap-3">
          <div class="avatar w-11 h-11 rounded-full text-[14px] flex-shrink-0" style="background:${r.bg}">${r.initials}</div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <div class="text-[13.5px] font-bold">${r.name}</div>
              ${r.key === cur.key ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-navy text-white uppercase tracking-wider">Aktif</span>' : ''}
            </div>
            <div class="text-[11.5px] text-muted-foreground mt-0.5">${r.jawatan}</div>
            <div class="mt-2 inline-flex items-center gap-1.5">
              <span class="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wider">${r.tier}</span>
              <span class="text-[10px] mono text-muted-foreground">${r.gred}</span>
            </div>
            <div class="mt-2 text-[11px] text-slate-600 leading-snug">${r.desc}</div>
          </div>
        </div>
      </button>
    `).join('');
    showModal({
      title: 'Tukar Peranan Pengguna (RBAC Demo)',
      subtitle: 'Pilih peranan untuk lihat antara muka & akses berbeza. Persisted dalam browser ini.',
      bodyHtml: `<div class="grid grid-cols-1 gap-2.5">${cards}</div>
        <div class="mt-4 p-3 bg-warning-50 border border-warning-100 rounded-md text-[11.5px] text-warning-700">
          <div class="font-semibold mb-0.5">⚠ Demo sahaja</div>
          Pemilihan peranan dalam prototaip ini bukan kebenaran sebenar — sistem produksi akan guna JDN SSO + Keycloak dengan policy enforcement.
        </div>`,
      width: '560px',
      noActions: true,
      onMount: (modal) => {
        modal.querySelectorAll('.jt-role-card').forEach(c => {
          c.addEventListener('click', () => setRole(c.dataset.role));
        });
      },
    });
  }

  // =========================================================================
  // GENERIC MODAL
  // =========================================================================
  function showModal({title, subtitle, bodyHtml, actions, width, noActions, onMount}) {
    const existing = document.getElementById('jt-modal-overlay');
    if (existing) existing.remove();
    const ov = document.createElement('div');
    ov.id = 'jt-modal-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px);animation:jtFade 0.15s ease;';
    const acts = noActions ? '' : `
      <div style="padding:14px 22px;border-top:1px solid #eef1f5;display:flex;justify-content:flex-end;gap:8px;background:#fafbfc;">
        ${(actions || [{label:'Tutup', primary: true}]).map((a, i) => `
          <button data-act="${i}" style="height:36px;padding:0 16px;border-radius:6px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid ${a.primary ? '#1e3a5f' : '#cbd5e1'};background:${a.primary ? '#1e3a5f' : '#fff'};color:${a.primary ? '#fff' : '#334155'};">${a.label}</button>
        `).join('')}
      </div>`;
    ov.innerHTML = `
      <style>@keyframes jtFade{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}</style>
      <div style="background:#fff;border-radius:12px;width:100%;max-width:${width || '480px'};max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="padding:18px 22px;border-bottom:1px solid #eef1f5;display:flex;align-items:start;justify-content:space-between;gap:12px;">
          <div style="min-width:0;flex:1;">
            <div style="font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">${title || ''}</div>
            ${subtitle ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">${subtitle}</div>` : ''}
          </div>
          <button id="jt-modal-close" style="background:none;border:0;cursor:pointer;color:#64748b;padding:4px;border-radius:4px;" title="Tutup (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="padding:18px 22px;overflow-y:auto;flex:1;font-size:13px;color:#334155;line-height:1.55;">${bodyHtml || ''}</div>
        ${acts}
      </div>
    `;
    document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('#jt-modal-close').addEventListener('click', close);
    if (!noActions && actions) {
      ov.querySelectorAll('[data-act]').forEach(b => {
        b.addEventListener('click', () => {
          const i = +b.dataset.act;
          const a = actions[i];
          if (a.onClick) a.onClick();
          if (!a.keepOpen) close();
        });
      });
    } else if (!noActions) {
      ov.querySelector('[data-act]').addEventListener('click', close);
    }
    if (onMount) onMount(ov);
    return { close };
  }

  // =========================================================================
  // TOAST NOTIFICATION
  // =========================================================================
  function toast(msg, type) {
    const colors = { success: '#16a34a', error: '#dc2626', info: '#1e3a5f', warn: '#f59e0b' };
    const c = colors[type || 'success'];
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:80px;right:24px;background:#fff;border-left:3px solid ${c};box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:12px 18px 12px 16px;border-radius:6px;z-index:9999;font-size:12.5px;font-weight:500;color:#0f172a;max-width:340px;animation:jtSlide 0.2s ease;`;
    t.innerHTML = `<style>@keyframes jtSlide{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}</style>${msg}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2700);
    setTimeout(() => t.remove(), 3100);
  }

  // =========================================================================
  // AUTO-WIRE — scan page & hook up dead buttons by text/class
  // =========================================================================
  function autowire() {
    const role = getRole();

    // Tag the page so role-based CSS can apply
    document.body.dataset.jtRole = role.key;
    if (role.readOnly) document.body.dataset.jtReadonly = '1';

    // -- Wire role switcher button (in sidebar)
    const sw = document.getElementById('jt-role-switcher');
    if (sw) sw.addEventListener('click', showRoleSwitcher);
    const ri = document.getElementById('jt-role-info');
    if (ri) ri.addEventListener('click', (e) => { e.stopPropagation(); showRoleSwitcher(); });
    const ta = document.getElementById('jt-topbar-avatar');
    if (ta) ta.addEventListener('click', showRoleSwitcher);

    // -- Wire topbar notif button
    const nb = document.getElementById('jt-notif-btn');
    if (nb) nb.addEventListener('click', () => location.href = 'Pusat Amaran.html');

    // -- Wire BM/EN language toggle
    const langWrap = document.querySelector('header.jt-topbar > div:last-child > div.flex.items-center.gap-1.rounded-md.border');
    if (langWrap && !langWrap.dataset.jtWired) {
      langWrap.dataset.jtWired = '1';
      langWrap.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          const lang = (b.textContent || '').trim();
          // Toggle visual state
          langWrap.querySelectorAll('button').forEach(x => {
            x.className = 'px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground hover:bg-muted rounded';
          });
          b.className = 'px-2 py-0.5 text-[10.5px] font-semibold rounded bg-navy text-white';
          // Toast feedback
          if (typeof toast === 'function') {
            toast(lang === 'EN' ? 'Language switched to English' : 'Bahasa ditukar ke Bahasa Malaysia', 'info');
          }
        });
      });
    }

    // -- Wire topbar search → command palette
    const search = document.getElementById('jt-search');
    if (search) {
      search.addEventListener('focus', showCommandPalette);
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); showCommandPalette(); }
      });
    }

    // -- Wire all buttons inside <main> by text content
    const buttons = document.querySelectorAll('main button:not([data-jt-wired]), main a:not([href]):not([data-jt-wired])');
    buttons.forEach(b => {
      // Skip buttons that already have onclick handlers via inline or jQuery
      if (b.onclick || b.dataset.jtWired) return;
      const txt = (b.textContent || '').trim().toLowerCase();
      const wireFn = matchAction(txt, b);
      if (wireFn) {
        b.addEventListener('click', wireFn);
        b.dataset.jtWired = '1';
        b.style.cursor = 'pointer';
      }
    });

    // -- Wire row-hover table rows in dashboard/list pages — make them clickable
    document.querySelectorAll('main table tr.row-hover:not([data-jt-wired])').forEach(row => {
      row.dataset.jtWired = '1';
      row.style.cursor = 'pointer';
      row.addEventListener('click', (e) => {
        if (e.target.closest('a,button,input')) return;
        location.href = 'Detail Projek.html';
      });
    });

    // -- Apply read-only mode for Viewer
    if (role.readOnly) {
      document.querySelectorAll('main button, main a').forEach(b => {
        const t = (b.textContent || '').trim().toLowerCase();
        if (/sahkan|tolak|hantar|mula|sediakan|projek baharu|jana|eksport|kemaskini|tambah|baharu|edit/i.test(t)) {
          b.disabled = true;
          b.style.opacity = '0.4';
          b.style.cursor = 'not-allowed';
          b.title = 'Akses hanya-baca (Viewer)';
        }
      });
    }
  }

  // Pattern → action mapping (kept simple; extend as needed)
  function matchAction(txt, el) {
    if (!txt) return null;
    // SKALA refresh
    if (/kemaskini.*skala|segarkan.*skala|sync.*skala/i.test(txt)) {
      return () => { toast('Data SKALA disegerakkan · 247 rekod dikemaskini', 'success'); };
    }
    // Export PDF/CSV/Excel
    if (/eksport|muat turun|download/i.test(txt)) {
      return () => showExportModal(txt);
    }
    // New project
    if (/projek baharu|tambah projek|new project/i.test(txt)) {
      return () => showNewProjectModal();
    }
    // "Lihat semua" / "Semua" → likely navigation
    if (/lihat semua|semua projek|view all/i.test(txt)) {
      return () => location.href = 'Senarai Projek.html';
    }
    if (/^semua$/i.test(txt)) {
      return () => location.href = 'Pusat Amaran.html';
    }
    // Generic "Lihat →"
    if (/^lihat\s*→?$/i.test(txt) || /^buka$/i.test(txt)) {
      return () => location.href = 'Detail Projek.html';
    }
    // Filter pills (have chevron icon)
    const isFilterPill = el.querySelector && el.querySelector('svg polyline[points*="6 9"]');
    if (isFilterPill) {
      return (e) => {
        e.stopPropagation();
        showFilterDropdown(el, txt);
      };
    }
    // Tandakan dibaca
    if (/tandakan.*baca|mark.*read/i.test(txt)) {
      return () => { toast('Semua amaran ditanda telah dibaca', 'success'); };
    }
    // Sahkan / Tolak / Approve
    if (/^sahkan$|approve|luluskan/i.test(txt)) {
      return () => showApproveModal('sahkan');
    }
    if (/^tolak$|reject/i.test(txt)) {
      return () => showApproveModal('tolak');
    }
    // Jana / Generate
    if (/jana surat|jana laporan|generate/i.test(txt)) {
      return () => location.href = 'Jana Surat.html';
    }
    // Hantar
    if (/^hantar$|submit|kirim/i.test(txt)) {
      return () => { toast('Berjaya dihantar untuk semakan', 'success'); };
    }
    // Mula intervensi / Mulakan Fasa N
    if (/mula.*fasa\s*2|mulakan fasa 2|mulakan pelaksanaan/i.test(txt)) return () => location.href = 'Borang Penilaian.html';
    if (/mula.*fasa\s*3|mulakan fasa 3|mulakan pelaporan/i.test(txt)) return () => location.href = 'Laporan Intervensi Form.html';
    if (/mula.*fasa\s*4|mulakan fasa 4|mulakan pasca/i.test(txt)) return () => location.href = 'Susulan Bulanan.html';
    if (/mula(kan)?\s+intervensi/i.test(txt)) return () => location.href = 'Pra-Intervensi.html';
    // Tetapkan pasukan
    if (/tetapkan pasukan|lantik pasukan/i.test(txt)) return () => location.href = 'Tetapkan Pasukan.html';
    // Lampiran B
    if (/lampiran b|checklist dokumen/i.test(txt)) return () => location.href = 'Lampiran B.html';
    return null;
  }

  // =========================================================================
  // PRESET MODALS
  // =========================================================================
  function showExportModal(label) {
    showModal({
      title: 'Eksport Dokumen',
      subtitle: 'Pilih format & skop data untuk eksport',
      bodyHtml: `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          <label style="border:1px solid #cbd5e1;border-radius:8px;padding:14px 10px;cursor:pointer;text-align:center;background:#f8fafc;">
            <input type="radio" name="fmt" value="pdf" checked style="display:none">
            <div style="font-size:24px;color:#dc2626;">📄</div>
            <div style="font-weight:600;font-size:12px;margin-top:4px;">PDF</div>
            <div style="font-size:10.5px;color:#64748b;">Format rasmi</div>
          </label>
          <label style="border:1px solid #cbd5e1;border-radius:8px;padding:14px 10px;cursor:pointer;text-align:center;">
            <input type="radio" name="fmt" value="xlsx" style="display:none">
            <div style="font-size:24px;color:#16a34a;">📊</div>
            <div style="font-weight:600;font-size:12px;margin-top:4px;">Excel</div>
            <div style="font-size:10.5px;color:#64748b;">Analisis data</div>
          </label>
          <label style="border:1px solid #cbd5e1;border-radius:8px;padding:14px 10px;cursor:pointer;text-align:center;">
            <input type="radio" name="fmt" value="docx" style="display:none">
            <div style="font-size:24px;color:#1e3a5f;">📝</div>
            <div style="font-weight:600;font-size:12px;margin-top:4px;">Word</div>
            <div style="font-size:10.5px;color:#64748b;">Boleh edit</div>
          </label>
        </div>
        <div style="margin-top:14px;font-size:12px;">
          <div style="font-weight:600;margin-bottom:6px;">Skop Data:</div>
          <label style="display:flex;align-items:center;gap:8px;padding:6px 0;"><input type="radio" name="scope" checked> Halaman semasa sahaja</label>
          <label style="display:flex;align-items:center;gap:8px;padding:6px 0;"><input type="radio" name="scope"> Semua data terpilih</label>
          <label style="display:flex;align-items:center;gap:8px;padding:6px 0;"><input type="radio" name="scope"> Format laporan rasmi (Appendix)</label>
        </div>
        <div style="margin-top:12px;padding:10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;font-size:11.5px;color:#075985;">
          <strong>Nota:</strong> Output PDF rasmi mengikut format Garis Panduan Intervensi JKR — header/footer JKR, ISO certifications, paragraf bernombor.
        </div>
      `,
      actions: [
        { label: 'Batal' },
        { label: 'Eksport', primary: true, onClick: () => toast('Eksport berjaya · Fail dimuat turun', 'success') },
      ],
    });
  }

  function showNewProjectModal() {
    showModal({
      title: 'Tambah Projek Baharu untuk Pemantauan',
      subtitle: 'Projek baharu akan ditarik dari SKALA dan dimasukkan ke senarai pemantauan PSG',
      bodyHtml: `
        <div style="font-size:12.5px;">
          <label style="display:block;margin-bottom:12px;">
            <div style="font-weight:600;margin-bottom:4px;">No. Rujukan SKALA</div>
            <input placeholder="cth: PRJ-N9-2024-0042" style="width:100%;height:36px;padding:0 12px;border:1px solid #cbd5e1;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:12.5px;">
          </label>
          <label style="display:block;margin-bottom:12px;">
            <div style="font-weight:600;margin-bottom:4px;">Sebab Pemantauan</div>
            <select style="width:100%;height:36px;padding:0 12px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;font-size:12.5px;">
              <option>Lewat jadual ≥10% atau ≥30 hari (auto-flag SKALA)</option>
              <option>Projek sensitif/berimpak tinggi</option>
              <option>Projek di bawah pemantauan ICU</option>
              <option>Manual override (Admin)</option>
            </select>
          </label>
          <label style="display:block;margin-bottom:12px;">
            <div style="font-weight:600;margin-bottom:4px;">Nota tambahan (pilihan)</div>
            <textarea rows="3" placeholder="cth: Disyorkan oleh Mesyuarat Pengurusan Portfolio JKR…" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:12.5px;font-family:inherit;resize:vertical;"></textarea>
          </label>
        </div>
      `,
      actions: [
        { label: 'Batal' },
        { label: 'Tambah ke Pemantauan', primary: true, onClick: () => { toast('Projek baharu ditambah · Status: Menunggu Pra-Intervensi', 'success'); setTimeout(() => location.href = 'Senarai Projek.html', 800); } },
      ],
    });
  }

  function showApproveModal(action) {
    const isApprove = action === 'sahkan';
    showModal({
      title: isApprove ? 'Sahkan Laporan Intervensi' : 'Tolak / Pulangkan untuk Pindaan',
      subtitle: isApprove ? 'Laporan akan ditandakan diluluskan dan boleh diedarkan' : 'Pasukan Penyedia akan dimaklumkan untuk pindaan',
      bodyHtml: `
        <div style="font-size:12.5px;">
          <label style="display:block;margin-bottom:12px;">
            <div style="font-weight:600;margin-bottom:4px;">${isApprove ? 'Komen kelulusan (pilihan)' : 'Sebab pulangan / pindaan diperlukan'}</div>
            <textarea rows="4" placeholder="${isApprove ? 'cth: Laporan komprehensif, semua isu telah diliputi…' : 'Sila huraikan bahagian yang perlu dipinda…'}" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:12.5px;font-family:inherit;resize:vertical;"></textarea>
          </label>
          ${isApprove ? `
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;padding:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">
              <input type="checkbox" checked> Edaran automatik kepada CPAB Ibu Pejabat (wajib)
            </label>
          ` : ''}
        </div>
      `,
      actions: [
        { label: 'Batal' },
        { label: isApprove ? 'Sahkan & Edarkan' : 'Pulangkan', primary: true, onClick: () => {
          toast(isApprove ? 'Laporan disahkan · Edaran berjaya' : 'Laporan dipulangkan kepada Penyedia', isApprove ? 'success' : 'warn');
          if (isApprove) setTimeout(() => location.href = 'Laporan Diluluskan.html', 800);
        } },
      ],
    });
  }

  function showFilterDropdown(el, label) {
    // crude dropdown — popover with a few options
    document.querySelectorAll('.jt-filter-pop').forEach(p => p.remove());
    const isNegeri = /negeri/i.test(label);
    const isCawangan = /cawangan/i.test(label);
    const isTahun = /tahun/i.test(label);
    let opts = [];
    if (isNegeri) opts = ['Semua Negeri', 'WP Putrajaya', 'Selangor', 'Negeri Sembilan', 'Perak', 'Pahang', 'Sabah', 'Sarawak', 'Kedah', 'Pulau Pinang'];
    else if (isCawangan) opts = ['Semua Cawangan', 'CKP Putrajaya', 'Cawangan Jalan', 'Cawangan Bangunan', 'Cawangan Mekanikal', 'Cawangan Elektrik', 'Cawangan Arkitek'];
    else if (isTahun) opts = ['Tahun 2026', 'Tahun 2025', 'Tahun 2024', '5 tahun terkini'];
    else opts = ['Semua', 'Pilihan A', 'Pilihan B', 'Pilihan C'];
    const r = el.getBoundingClientRect();
    const pop = document.createElement('div');
    pop.className = 'jt-filter-pop';
    pop.style.cssText = `position:fixed;top:${r.bottom + 4}px;left:${r.left}px;background:#fff;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:200px;max-height:300px;overflow-y:auto;z-index:9997;padding:4px;font-size:12.5px;`;
    pop.innerHTML = opts.map(o => `<div class="jt-fp-item" data-v="${o}" style="padding:8px 12px;border-radius:5px;cursor:pointer;">${o}</div>`).join('');
    document.body.appendChild(pop);
    pop.querySelectorAll('.jt-fp-item').forEach(it => {
      it.addEventListener('mouseenter', () => it.style.background = '#f1f5f9');
      it.addEventListener('mouseleave', () => it.style.background = 'transparent');
      it.addEventListener('click', () => {
        const v = it.dataset.v;
        // update label inside pill
        const txtNode = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
        if (txtNode) txtNode.textContent = v;
        else el.firstChild && (el.firstChild.nextSibling.textContent = ' ' + v);
        toast('Filter diaplikasi: ' + v, 'info');
        pop.remove();
      });
    });
    setTimeout(() => {
      const off = (e) => { if (!pop.contains(e.target) && e.target !== el) { pop.remove(); document.removeEventListener('click', off); } };
      document.addEventListener('click', off);
    }, 0);
  }

  function showCommandPalette() {
    const pages = DEMO_FLOW.map(([f, t]) => ({file: f, title: t}));
    pages.push({file: 'Borang Penilaian.html', title: 'Borang Penilaian Appendix C'});
    pages.push({file: 'Lampiran B.html', title: 'Lampiran B — Checklist Dokumen'});
    pages.push({file: 'Susulan Bulanan.html', title: 'Susulan Bulanan (Fasa Pasca)'});
    pages.push({file: 'demo.html', title: 'Demo Navigator (semua skrin)'});
    showModal({
      title: 'Carian Pantas',
      subtitle: 'Cari skrin, projek, pengguna, dokumen…',
      bodyHtml: `
        <input id="jt-cmd-search" placeholder="Taip untuk cari…" autofocus style="width:100%;height:40px;padding:0 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:13.5px;margin-bottom:10px;">
        <div id="jt-cmd-results" style="max-height:340px;overflow-y:auto;">
          ${pages.map(p => `<a href="${encodeURI(p.file)}" data-title="${p.title.toLowerCase()}" class="jt-cmd-item" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:5px;text-decoration:none;color:#0f172a;font-size:12.5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${p.title}</span>
            <span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:10px;color:#94a3b8;">${p.file}</span>
          </a>`).join('')}
        </div>
      `,
      width: '600px',
      noActions: true,
      onMount: (m) => {
        const inp = m.querySelector('#jt-cmd-search');
        const items = m.querySelectorAll('.jt-cmd-item');
        items.forEach(i => {
          i.addEventListener('mouseenter', () => i.style.background = '#f1f5f9');
          i.addEventListener('mouseleave', () => i.style.background = 'transparent');
        });
        inp.addEventListener('input', () => {
          const q = inp.value.toLowerCase();
          items.forEach(i => i.style.display = (!q || i.dataset.title.includes(q)) ? 'flex' : 'none');
        });
      },
    });
  }

  // =========================================================================
  // MOBILE RESPONSIVE LAYER (existing)
  // =========================================================================
  function injectMobileCSS() {
    if (document.getElementById('jt-mobile-css')) return;
    const style = document.createElement('style');
    style.id = 'jt-mobile-css';
    style.textContent = `
      .jt-hamburger { display: none; }
      [data-jt-readonly="1"] main button[disabled] { pointer-events: none; }
      @media (max-width: 767px) {
        html, body { overflow-x: hidden; }
        .min-h-screen.flex { position: relative; }
        aside.w-60 {
          position: fixed !important; top: 0; left: 0; bottom: 0;
          width: 260px !important; z-index: 45;
          transform: translateX(-100%); transition: transform 0.22s ease;
          box-shadow: 2px 0 24px rgba(0,0,0,0.22);
        }
        body.jt-drawer-open aside.w-60 { transform: translateX(0); }
        .jt-drawer-backdrop { position: fixed; inset: 0; z-index: 40; background: rgba(19, 37, 62, 0.5); opacity: 0; pointer-events: none; transition: opacity 0.22s ease; }
        body.jt-drawer-open .jt-drawer-backdrop { opacity: 1; pointer-events: auto; }
        .jt-hamburger { display: inline-flex !important; }
        header.jt-topbar { padding-left: 12px !important; padding-right: 12px !important; }
        header.jt-topbar > div:last-child > div.relative { display: none; }
        header.jt-topbar > div:last-child > div.flex.items-center.gap-1 { display: none; }
        main.flex-1 { overflow-x: hidden; }
        main section[class*="px-6"], main section[class*="px-8"] { padding-left: 16px !important; padding-right: 16px !important; }
        .grid.grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .grid.grid-cols-3, .grid.grid-cols-2, .grid.grid-cols-5, .grid.grid-cols-6 { grid-template-columns: 1fr !important; }
        [class*="md:grid-cols-"], [class*="lg:grid-cols-"], [class*="xl:grid-cols-"] { grid-template-columns: 1fr !important; }
        [class*="grid-cols-["] { grid-template-columns: 1fr !important; }
        main .flex[class*="gap-"] { flex-wrap: wrap !important; }
        main .flex.items-start:not([class*="gap-1"]):not([class*="gap-2"]), main .flex.items-stretch { flex-wrap: wrap !important; }
        main [class*="flex"][class*="gap-6"] > *, main [class*="flex"][class*="gap-8"] > * { flex: 1 1 100% !important; min-width: 0 !important; max-width: 100% !important; }
        main [class*="min-w-"] { min-width: 0 !important; }
        main [class*="w-80"], main [class*="w-[320px]"], main [class*="w-[300px]"], main [class*="w-96"], main [class*="w-72"] { width: 100% !important; max-width: 100% !important; flex-basis: 100% !important; }
        main .grid { gap: 0.75rem !important; }
        main table { font-size: 11px !important; }
        main .overflow-auto, main .overflow-x-auto { -webkit-overflow-scrolling: touch; }
        main [class*="w-72"], main [class*="w-80"], main [class*="w-96"] { width: 100% !important; max-width: 100% !important; }
        main h1 { font-size: 22px !important; line-height: 1.25 !important; }
        main h2 { font-size: 18px !important; }
        main .text-\\[26px\\] { font-size: 20px !important; }
        main .text-\\[22px\\] { font-size: 18px !important; }
        #jt-demo-nav { bottom: 12px !important; padding: 4px !important; gap: 2px !important; font-size: 11px !important; max-width: calc(100vw - 24px); }
        #jt-demo-nav a, #jt-demo-nav button { height: 30px !important; padding: 0 10px !important; }
        #jt-demo-nav .jt-dn-title { max-width: 110px !important; font-size: 11px !important; }
        #jt-demo-nav .jt-dn-home span { display: none !important; }
        #jt-demo-nav .jt-dn-home { padding: 0 8px !important; }
        #jt-demo-nav .jt-dn-step { min-width: 44px !important; font-size: 9.5px !important; }
        body.jt-auth main > section, .min-h-screen.grid.grid-cols-2 { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function setupDrawer() {
    if (!document.querySelector('.jt-drawer-backdrop')) {
      const bd = document.createElement('div');
      bd.className = 'jt-drawer-backdrop';
      bd.addEventListener('click', () => document.body.classList.remove('jt-drawer-open'));
      document.body.appendChild(bd);
    }
    document.querySelectorAll('.jt-hamburger').forEach(btn => {
      if (btn.dataset.jtBound) return;
      btn.dataset.jtBound = '1';
      btn.addEventListener('click', (e) => { e.stopPropagation(); document.body.classList.toggle('jt-drawer-open'); });
    });
    document.querySelectorAll('aside.w-60 a').forEach(a => {
      if (a.dataset.jtBound) return;
      a.dataset.jtBound = '1';
      a.addEventListener('click', () => document.body.classList.remove('jt-drawer-open'));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('jt-drawer-open')) {
        document.body.classList.remove('jt-drawer-open');
      }
    });
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================
  window.JTRACK = {
    mountChrome(active, crumbs) {
      const sb = document.getElementById('jt-sidebar');
      const tb = document.getElementById('jt-topbar');
      if (sb) sb.outerHTML = renderSidebar(active);
      if (tb) tb.outerHTML = renderTopbar(crumbs || []);
      setupDrawer();
      autowire();
    },
    role: getRole,
    setRole,
    showRoleSwitcher,
    showModal,
    toast,
    showCommandPalette,
    showExportModal,
    showApproveModal,
  };

  injectMobileCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { setupDrawer(); autowire(); });
  } else {
    setupDrawer();
    autowire();
  }

  // =========================================================================
  // DEMO NAV BAR — extended DEMO_FLOW with new screens
  // =========================================================================
  const DEMO_FLOW = [
    ['Log Masuk.html',                'Log Masuk'],
    ['Daftar Akaun.html',             'Daftar Akaun'],
    ['Pengesahan Emel.html',          'Pengesahan Emel'],
    ['Profil Pengguna.html',          'Profil Pengguna'],
    ['Dashboard.html',                'Dashboard'],
    ['Senarai Projek.html',           'Senarai Projek'],
    ['Detail Projek.html',            'Detail Projek'],
    ['Pilih Projek.html',             'Pilih Projek (Cadangan PSG)'],
    ['Modal Kunci Maklumat.html',     'Modal Kunci Maklumat'],
    ['Pra-Intervensi.html',           'Fasa 1 · Pra-Intervensi'],
    ['Tarikh Intervensi.html',        'Fasa 1 · Tarikh Intervensi'],
    ['Tetapkan Pasukan.html',         'Fasa 1 · Tetapkan Pasukan'],
    ['Surat Lantikan.html',           'Fasa 1 · Surat Lantikan (Appendix A)'],
    ['Lampiran B.html',               'Fasa 2 · Checklist Dokumen (Lampiran B)'],
    ['Borang Penilaian.html',         'Fasa 2 · Borang Penilaian (Appendix C)'],
    ['Tindakan Pengesyoran.html',     'Fasa 2 · Tindakan Pengesyoran'],
    ['Laporan Intervensi.html',       'Fasa 3 · Laporan Intervensi'],
    ['Laporan Intervensi Form.html',  'Fasa 3 · Laporan Intervensi (Borang)'],
    ['Semakan Pengesah.html',         'Fasa 3 · Semakan Pengesah'],
    ['Muktamadkan Laporan.html',      'Fasa 3 · Muktamadkan Laporan'],
    ['Laporan Diluluskan.html',       'Fasa 3 · Laporan Diluluskan'],
    ['Jana Surat.html',               'Fasa 3 · Jana Surat Edaran (Appendix E)'],
    ['Susulan Bulanan.html',          'Fasa 4 · Susulan Bulanan (3 bulan)'],
    ['Ruang Catatan.html',            'Fasa 4 · Ruang Catatan Tapak'],
    ['Penilaian Prestasi.html',       'Fasa 4 · Penilaian Prestasi'],
    ['Mesyuarat Penutup.html',        'Fasa 4 · Mesyuarat Penutup'],
    ['Workflow Visualizer.html',      'Carta Alir 4 Fasa Intervensi'],
    ['Pusat Amaran.html',             'Pusat Amaran'],
    ['Email Notification.html',       'Email Notification'],
    ['Laporan Kemajuan Bulanan.html', 'Laporan Kemajuan Bulanan'],
    ['Log Audit.html',                'Log Jejak Audit'],
    ['Pengurusan Pengguna.html',      'Pengurusan Pengguna (RBAC)'],
  ];

  function injectDemoNav() {
    try {
      const path = decodeURIComponent((location.pathname.split('/').pop() || '').replace(/^\/+/, ''));
      if (!path || path === 'demo.html' || path === 'index.html') return;
      const idx = DEMO_FLOW.findIndex(([f]) => f === path);
      if (idx === -1) return;

      const total = DEMO_FLOW.length;
      const prev = idx > 0 ? DEMO_FLOW[idx - 1] : null;
      const next = idx < total - 1 ? DEMO_FLOW[idx + 1] : null;
      const cur  = DEMO_FLOW[idx];

      const bar = document.createElement('div');
      bar.id = 'jt-demo-nav';
      bar.innerHTML = `
        <style>
          #jt-demo-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            z-index: 9997; display: flex; align-items: center; gap: 4px;
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
          #jt-demo-nav .jt-dn-title { font-weight: 600; white-space: nowrap; max-width: 280px;
            overflow: hidden; text-overflow: ellipsis;
          }
          #jt-demo-nav .jt-dn-disabled { opacity: 0.28; pointer-events: none; }
          #jt-demo-nav svg { width: 14px; height: 14px; flex-shrink: 0; }
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

      document.getElementById('jt-dn-toggle').addEventListener('click', () => {
        bar.classList.toggle('jt-hidden');
      });

      document.addEventListener('keydown', (e) => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (e.key === 'ArrowLeft' && prev)  { e.preventDefault(); location.href = encodeURI(prev[0]); }
        if (e.key === 'ArrowRight' && next) { e.preventDefault(); location.href = encodeURI(next[0]); }
        if (e.key === 'Escape')             { e.preventDefault(); location.href = 'demo.html'; }
        if (e.key === 'h' || e.key === 'H') { bar.classList.toggle('jt-hidden'); }
      });
    } catch (err) {
      console && console.warn && console.warn('demo-nav inject failed', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDemoNav);
  } else {
    injectDemoNav();
  }
})();
