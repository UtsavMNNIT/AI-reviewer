import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { RadarPoint } from '../../data/mockReport'
import { AXIS, BRAND, GRID, tooltipStyle } from './chartTheme'

type Props = { data: RadarPoint[] }

/** Skills breakdown across performance categories. */
export default function PerformanceRadar({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-white">Skill breakdown</h2>
      <p className="mt-1 text-sm text-slate-400">Strength across evaluation categories.</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: AXIS, fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
            <Radar
              name="Score"
              dataKey="score"
              stroke={BRAND}
              fill={BRAND}
              fillOpacity={0.4}
            />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
