'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedSummaryProps {
  summary: string
  tasks: string[]
  onAnimationComplete: () => void
}

const sentenceVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.8,
      delayChildren: 0.3
    }
  },
}

const AnimatedSummary: React.FC<AnimatedSummaryProps> = ({ summary, tasks, onAnimationComplete }) => {
  const [isComplete, setIsComplete] = useState(false)
  const sentences = summary.split(/(?<=[.!?])\s+/)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true)
      onAnimationComplete()
    }, (sentences.length + tasks.length) * 800 + 1000) // Adjust timing based on stagger delay

    return () => clearTimeout(timer)
  }, [sentences.length, tasks.length, onAnimationComplete])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {sentences.map((sentence, index) => (
        <motion.p
          key={index}
          variants={sentenceVariants}
          className="text-foreground/90 mb-2"
        >
          {sentence}
        </motion.p>
      ))}
      {tasks.length > 0 && (
        <motion.div 
          className="mt-4"
          variants={containerVariants}
        >
          <motion.h3 
            variants={sentenceVariants}
            className="font-semibold text-lg mb-2 text-foreground"
          >
            Suggested Tasks:
          </motion.h3>
          <ul className="list-disc list-inside">
            {tasks.map((task, index) => (
              <motion.li
                key={index}
                variants={sentenceVariants}
                className="text-foreground/90 mb-1"
              >
                {task}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AnimatedSummary
