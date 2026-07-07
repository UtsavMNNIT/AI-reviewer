import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  score: number
  icon: LucideIcon
  /** Accent color for the gauge + icon (hex). Defaults to brand indigo. */
  accent?: string
}

/** A score tile: label, big /100 number, and a radial gauge showing the score. */
export default function ScoreCard({ label, score, icon: Icon, accent = '#6366f1' }: Props) {
  const data = [{ name: label, value: score, fill: accent }]

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl bg-brand-500/10 p-2" style={{ color: accent }}>
          <Icon size={20} />
        </div>
        <div className="relative h-16 w-16">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              barSize={6}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              {/* Maps value → angle over a fixed 0–100 scale (hidden axis). */}
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              {/* Track ring behind the value bar. */}
              <RadialBar
                background={{ fill: '#1e293b' }}
                dataKey="value"
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
            {score}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {score}
        <span className="text-base font-normal text-slate-500"> / 100</span>
      </p>
    </div>
  )
}
