/** Shared Recharts styling tokens so charts read well on the dark slate theme. */

export const BRAND = '#6366f1' // brand-500
export const BRAND_LIGHT = '#818cf8' // brand-400
export const GRID = '#334155' // slate-700
export const AXIS = '#94a3b8' // slate-400

/** Slice colors for categorical charts (pie, etc.). */
export const CATEGORY_COLORS = ['#6366f1', '#818cf8', '#f59e0b']

/** Dark tooltip surface used across all charts. */
export const tooltipStyle = {
  backgroundColor: '#0f172a', // slate-900
  border: '1px solid #334155', // slate-700
  borderRadius: '0.75rem',
  color: '#e2e8f0', // slate-200
} as const
