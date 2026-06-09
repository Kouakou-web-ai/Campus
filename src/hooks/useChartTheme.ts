import { useThemeStore } from '../store/themeStore';

const CHART_PALETTE = {
  light: {
    grid: '#e2e8f0',
    axis: '#94a3b8',
    tooltipBg: '#0f172a',
    tooltipText: '#f8fafc',
    primary: '#6366f1',
    secondary: '#818cf8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    series: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
  },
  dark: {
    grid: '#334155',
    axis: '#64748b',
    tooltipBg: '#1e293b',
    tooltipText: '#f1f5f9',
    primary: '#818cf8',
    secondary: '#a5b4fc',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    series: ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'],
  },
} as const;

export function useChartTheme() {
  const mode = useThemeStore((s) => s.mode);
  return CHART_PALETTE[mode];
}
