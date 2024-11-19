'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
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

  const createBubble = useCallback((): Bubble => {
    const colors = [
      'bg-gradient-to-br from-blue-400/40 to-purple-400/40',
      'bg-gradient-to-br from-purple-400/40 to-pink-400/40',
      'bg-gradient-to-br from-blue-400/40 to-indigo-400/40',
      'bg-gradient-to-br from-indigo-400/40 to-purple-400/40',
      'bg-gradient-to-br from-purple-400/40 to-pink-400/40' // TODO: Add more colors here
    ]
    return {
      id: Math.random(),
      size: Math.random() * 40 + 20, // Random size between 20 and 60
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100, // Random horizontal position
      duration: Math.random() * 15 + 15, // Random duration between 15 and 30 seconds
      delay: Math.random() * 2 // Random delay between 0 and 2 seconds
    }
  }, [])

  const getBubbleCount = useCallback(() => {
    if (screenWidth < 640) return 30 // mobile
    if (screenWidth < 1024) return 50 // tablet
    return 75 // desktop
  }, [screenWidth])

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      setBubbles([])
      return
    }

    // Create initial set of bubbles
    const initialBubbles = Array.from({ length: getBubbleCount() }, () => ({
      ...createBubble(),
      delay: Math.random() * 10 // Longer initial delay for a staggered start
    }))
    setBubbles(initialBubbles)

    // Create new bubbles at regular intervals
    const intervalId = setInterval(() => {
      setBubbles(currentBubbles => {
        if (currentBubbles.length < getBubbleCount()) {
          return [...currentBubbles, createBubble()]
        }
        return currentBubbles
      })
    }, 300) // Create a new bubble every 300ms

    // Clean up interval on component unmount or when disabled
    return () => clearInterval(intervalId)
  }, [createBubble, isEnabled, getBubbleCount])

  // Remove bubbles that have risen off-screen
  useEffect(() => {
    const cleanupId = setInterval(() => {
      setBubbles(currentBubbles => currentBubbles.filter(bubble => {
        const element = document.getElementById(`bubble-${bubble.id}`)
        return element && element.getBoundingClientRect().bottom > 0
      }))
    }, 1000) // Check for off-screen bubbles every second

    return () => clearInterval(cleanupId)
  }, [])

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEnabled(!isEnabled)}
              className="fixed top-4 right-4 z-50"
              aria-label="Toggle bubble background"
            >
              <Droplets className={isEnabled ? "text-blue-500" : "text-gray-500"} />
            </Button>
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