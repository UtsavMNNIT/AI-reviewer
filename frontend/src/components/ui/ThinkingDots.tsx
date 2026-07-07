import { motion } from 'framer-motion'

interface Props {
  label?: string
}

/**
 * A "thinking" indicator — three dots bouncing in a staggered sine wave, used
 * while the AI generates the next interview question.
 */
export default function ThinkingDots({ label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="flex items-end gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-3 w-3 rounded-full bg-brand-400"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  )
}
