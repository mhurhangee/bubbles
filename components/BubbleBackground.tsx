'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Droplets } from 'lucide-react'

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
  const [isEnabled, setIsEnabled] = useState(true)
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  const animationFrameId = useRef<number | null>(null)

  const createBubble = useCallback((): Bubble => {
    const colors = [
      'bg-gradient-to-br from-orange-400/40 to-red-400/40',
      'bg-gradient-to-br from-pink-400/40 to-purple-400/40',
      'bg-gradient-to-br from-yellow-400/40 to-orange-400/40',
      'bg-gradient-to-br from-indigo-400/40 to-purple-400/40',
      'bg-gradient-to-br from-pink-400/40 to-purple-400/40',
      'bg-gradient-to-br from-orange-400/40 to-violet-400/40',
      'bg-gradient-to-br from-yellow-400/40 to-pink-400/40',
      'bg-gradient-to-br from-red-400/40 to-indigo-400/40',
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
    if (isEnabled) {
      const initialBubbles = Array.from({ length: getBubbleCount() }, () => ({
        ...createBubble(),
        delay: Math.random() * 10
      }))
      setBubbles(initialBubbles)
      animationFrameId.current = requestAnimationFrame(animateBubbles)
    } else {
      setBubbles([])
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isEnabled, createBubble, getBubbleCount, animateBubbles])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
      } else if (isEnabled) {
        animationFrameId.current = requestAnimationFrame(animateBubbles)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isEnabled, animateBubbles])

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={isEnabled}
              onPressedChange={setIsEnabled}
              className="fixed top-4 right-4 z-50 backdrop-blur-md rounded-full bg-white/40 data-[state=on]:bg-white/40"
              aria-label="Toggle bubble background"
            >
              <Droplets className={isEnabled ? "text-orange-600" : "text-gray-500"} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isEnabled ? 'Disable' : 'Enable'} bubble background</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isEnabled && (
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
        </div>
      )}
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
    </>
  )
}