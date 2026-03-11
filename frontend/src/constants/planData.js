// ── Level thresholds (mirrors backend plan_data.py) ─────────────────────────
export const SKILL_THRESHOLDS = [0, 25, 75, 150, 250, 375, 525, 700, 900, 1150]

/** Returns progress % within the current level (0-100) and xp to next level. */
export function getXpBarData(xp, level) {
  if (level >= 10) return { pct: 100, xpCurrent: xp, xpNeeded: 0 }
  const lo = SKILL_THRESHOLDS[level - 1] ?? 0
  const hi = SKILL_THRESHOLDS[level] ?? SKILL_THRESHOLDS[9]
  const pct = Math.max(0, Math.min(100, ((xp - lo) / (hi - lo)) * 100))
  return { pct, xpCurrent: xp - lo, xpNeeded: hi - lo - (xp - lo) }
}

// ── Skill info + Tailwind color palette ────────────────────────────────────
// All class strings are COMPLETE LITERALS so Tailwind JIT includes them.
export const SKILL_INFO = {
  dsa: {
    label: 'DSA', icon: '⚔️',
    c: {
      text: 'text-cyan-400', border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10', bar: 'bg-cyan-400', ring: 'ring-cyan-500/30',
      glow: '0 0 12px rgba(34,211,238,0.5)',
    },
  },
  ml: {
    label: 'ML / AI', icon: '🧠',
    c: {
      text: 'text-violet-400', border: 'border-violet-500/40',
      bg: 'bg-violet-500/10', bar: 'bg-violet-400', ring: 'ring-violet-500/30',
      glow: '0 0 12px rgba(167,139,250,0.5)',
    },
  },
  backend: {
    label: 'Backend', icon: '🔧',
    c: {
      text: 'text-orange-400', border: 'border-orange-500/40',
      bg: 'bg-orange-500/10', bar: 'bg-orange-400', ring: 'ring-orange-500/30',
      glow: '0 0 12px rgba(251,146,60,0.5)',
    },
  },
  devops: {
    label: 'DevOps', icon: '🐳',
    c: {
      text: 'text-yellow-400', border: 'border-yellow-500/40',
      bg: 'bg-yellow-500/10', bar: 'bg-yellow-400', ring: 'ring-yellow-500/30',
      glow: '0 0 12px rgba(250,204,21,0.5)',
    },
  },
  cloud: {
    label: 'Cloud', icon: '☁️',
    c: {
      text: 'text-sky-400', border: 'border-sky-500/40',
      bg: 'bg-sky-500/10', bar: 'bg-sky-400', ring: 'ring-sky-500/30',
      glow: '0 0 12px rgba(56,189,248,0.5)',
    },
  },
  system_design: {
    label: 'Sys Design', icon: '🏗️',
    c: {
      text: 'text-indigo-400', border: 'border-indigo-500/40',
      bg: 'bg-indigo-500/10', bar: 'bg-indigo-400', ring: 'ring-indigo-500/30',
      glow: '0 0 12px rgba(129,140,248,0.5)',
    },
  },
  project: {
    label: 'Project', icon: '🚀',
    c: {
      text: 'text-emerald-400', border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10', bar: 'bg-emerald-400', ring: 'ring-emerald-500/30',
      glow: '0 0 12px rgba(52,211,153,0.5)',
    },
  },
  networking: {
    label: 'Networking', icon: '🤝',
    c: {
      text: 'text-pink-400', border: 'border-pink-500/40',
      bg: 'bg-pink-500/10', bar: 'bg-pink-400', ring: 'ring-pink-500/30',
      glow: '0 0 12px rgba(244,114,182,0.5)',
    },
  },
  interviewing: {
    label: 'Interview', icon: '🎯',
    c: {
      text: 'text-rose-400', border: 'border-rose-500/40',
      bg: 'bg-rose-500/10', bar: 'bg-rose-400', ring: 'ring-rose-500/30',
      glow: '0 0 12px rgba(251,113,133,0.5)',
    },
  },
  career: {
    label: 'Career', icon: '💼',
    c: {
      text: 'text-amber-400', border: 'border-amber-500/40',
      bg: 'bg-amber-500/10', bar: 'bg-amber-400', ring: 'ring-amber-500/30',
      glow: '0 0 12px rgba(251,191,36,0.5)',
    },
  },
}

// Display order for stat cards
export const SKILL_ORDER = [
  'dsa', 'ml', 'backend', 'devops', 'cloud',
  'system_design', 'project', 'networking', 'interviewing', 'career',
]

// ── Month metadata ─────────────────────────────────────────────────────────
export const MONTH_META = {
  1: { title: 'Foundations & Gaps',     icon: '🏗️', hex: '#2563EB', badgeIcon: '🛠️', badgeTitle: 'Backend Initiate' },
  2: { title: 'DevOps & ML Sharpening', icon: '🐳', hex: '#7C3AED', badgeIcon: '🧠', badgeTitle: 'ML Engineer Initiate' },
  3: { title: 'Cloud Deployment',       icon: '☁️', hex: '#16A34A', badgeIcon: '🚀', badgeTitle: 'Cloud Deployer' },
  4: { title: 'System Design & Resume', icon: '📄', hex: '#EA580C', badgeIcon: '📋', badgeTitle: 'Recruiter Ready' },
  5: { title: 'Mock Interviews & Apps', icon: '🎯', hex: '#DC2626', badgeIcon: '⚔️', badgeTitle: 'Interview Warrior' },
  6: { title: 'Polish, Practice, Peak', icon: '👑', hex: '#7C3AED', badgeIcon: '👑', badgeTitle: 'Boss Fight Ready' },
}
