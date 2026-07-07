import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DistributionSlice } from '../../data/mockReport'
import { CATEGORY_COLORS, tooltipStyle } from './chartTheme'

type Props = { data: DistributionSlice[] }

/** Donut showing how answers were distributed across quality bands. */
export default function ScoreDistributionPie({ data }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-white">Answer distribution</h2>
      <p className="mt-1 text-sm text-slate-400">Quality band across all answers.</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice, i) => (
                <Cell key={slice.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
