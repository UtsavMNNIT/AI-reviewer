import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TimelinePoint } from '../../data/mockReport'
import { AXIS, BRAND, GRID, tooltipStyle } from './chartTheme'

type Props = { data: TimelinePoint[] }

/** Overall score trend across past sessions. */
export default function PerformanceTimeline({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-white">Performance timeline</h2>
      <p className="mt-1 text-sm text-slate-400">Overall score across recent sessions.</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.5} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="session" tick={{ fill: AXIS, fontSize: 12 }} stroke={GRID} />
            <YAxis domain={[0, 100]} tick={{ fill: AXIS, fontSize: 12 }} stroke={GRID} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="score"
              stroke={BRAND}
              strokeWidth={2}
              fill="url(#timelineFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
