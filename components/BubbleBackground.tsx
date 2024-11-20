'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface Bubble {
  id: number
  size: number
  color: string
  left: number
  duration: number
  delay: number
}

export default function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  const animationFrameId = useRef<number | null>(null)

  const createBubble = useCallback((): Bubble => {
    const colors = [
      'bg-gradient-to-br from-bubblelight1/40 to-bubbledark1/40',
      'bg-gradient-to-br from-bubblelight2/40 to-bubbledark2/40',
      'bg-gradient-to-br from-bubblelight3/40 to-bubbledark3/40',
      'bg-gradient-to-br from-bubblelight4/40 to-bubbledark4/40',
      'bg-gradient-to-br from-bubblelight5/40 to-bubbledark5/40',
      'bg-gradient-to-br from-bubblelight6/40 to-bubbledark6/40',
      'bg-gradient-to-br from-bubblelight7/40 to-bubbledark7/40',
      'bg-gradient-to-br from-bubblelight8/40 to-bubbledark8/40',
    ]
    return {
      id: Math.random(),
      size: Math.random() * 40 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 2
    }
  }, [])

  const getBubbleCount = useCallback(() => {
    if (screenWidth < 640) return 30
    if (screenWidth < 1024) return 50
    return 75
  }, [screenWidth])

  const animateBubbles = useCallback(() => {
    setBubbles(currentBubbles => {
      const newBubbles = currentBubbles.filter(bubble => {
        const element = document.getElementById(`bubble-${bubble.id}`)
        return element && element.getBoundingClientRect().bottom > 0
      })

      if (newBubbles.length < getBubbleCount()) {
        newBubbles.push(createBubble())
      }

      return newBubbles
    })

    animationFrameId.current = requestAnimationFrame(animateBubbles)
  }, [createBubble, getBubbleCount])

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const initialBubbles = Array.from({ length: getBubbleCount() }, () => ({
      ...createBubble(),
      delay: Math.random() * 10
    }))
    setBubbles(initialBubbles)
    animationFrameId.current = requestAnimationFrame(animateBubbles)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [createBubble, getBubbleCount, animateBubbles])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
      } else {
        animationFrameId.current = requestAnimationFrame(animateBubbles)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [animateBubbles])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          id={`bubble-${bubble.id}`}
          className={`absolute rounded-full ${bubble.color}`}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: `-${bubble.size}px`,
            animation: `rise ${bubble.duration}s ${bubble.delay}s linear`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes rise {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-120vh);
          }
        }
      `}</style>
    </div>
  )
}