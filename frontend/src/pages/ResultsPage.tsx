import { Award, Code2, MessageSquare, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'
import ScoreCard from '../components/charts/ScoreCard'
import PerformanceRadar from '../components/charts/PerformanceRadar'
import ScoreDistributionPie from '../components/charts/ScoreDistributionPie'
import PerformanceTimeline from '../components/charts/PerformanceTimeline'
import { reportData } from '../data/mockReport'

const scoreCards = [
  { label: 'Overall Score', key: 'overall', icon: Award, accent: '#6366f1' },
  { label: 'Technical Score', key: 'technical', icon: Wrench, accent: '#818cf8' },
  { label: 'Communication Score', key: 'communication', icon: MessageSquare, accent: '#22c55e' },
  { label: 'Coding Score', key: 'coding', icon: Code2, accent: '#f59e0b' },
] as const

export default function ResultsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Performance Report</h1>
      <p className="mt-1 text-sm text-slate-400">
        Your scores and trends across interview and coding sessions.
      </p>

      {/* Score tiles. */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scoreCards.map(({ label, key, icon, accent }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ScoreCard label={label} score={reportData[key]} icon={icon} accent={accent} />
          </motion.div>
        ))}
      </div>

      {/* Radar + distribution side by side on large screens. */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PerformanceRadar data={reportData.radar} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ScoreDistributionPie data={reportData.distribution} />
        </motion.div>
      </div>

      {/* Full-width timeline. */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PerformanceTimeline data={reportData.timeline} />
      </motion.div>
    </div>
  )
}
