tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'], mono: ['JetBrains Mono','ui-monospace','monospace'] },
      colors: {
        border: '#e2e8f0', input: '#e2e8f0', foreground: '#0f172a',
        muted: { DEFAULT: '#f1f5f9', foreground: '#64748b' },
        navy: { DEFAULT:'#1e3a8a', 50:'#eff6ff', 100:'#dbeafe', 600:'#1d4ed8', 700:'#1e40af', 800:'#1e3a8a', 900:'#172554' },
        orange: { DEFAULT:'#f97316', 50:'#fff7ed', 100:'#ffedd5', 600:'#ea580c' },
        success: { DEFAULT:'#16a34a', 50:'#f0fdf4', 100:'#dcfce7', 700:'#15803d' },
        warning: { DEFAULT:'#f59e0b', 50:'#fffbeb', 100:'#fef3c7', 700:'#b45309' },
        critical: { DEFAULT:'#dc2626', 50:'#fef2f2', 100:'#fee2e2', 700:'#b91c1c' },
      },
    },
  },
};
