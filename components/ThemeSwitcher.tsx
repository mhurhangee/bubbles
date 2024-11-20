"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Palette, Volume2, VolumeX } from 'lucide-react'

const themes = [
  { name: 'Pastel', value: 'pastel' },
  { name: 'Forest', value: 'forest' },
  { name: 'Island', value: 'island' },
  { name: 'Campfire', value: 'campfire' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Midnight', value: 'midnight' },
  { name: 'Oasis', value: 'oasis' },
  { name: 'Galaxy', value: 'galaxy' },
]

const musicTracks = {
  pastel: '/music/pastel.mp3',
  forest: '/music/forest.mp3',
  island: '/music/island.mp3',
  campfire: '/music/campfire.mp3',
  ocean: '/music/ocean.mp3',
  midnight: '/music/midnight.mp3',
  oasis: '/music/oasis.mp3',
  galaxy: '/music/galaxy.mp3',
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('pastel')
  const [open, setOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'pastel'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicTracks[theme as keyof typeof musicTracks]
      audioRef.current.volume = volume
      if (!isMuted) {
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error))
      }
    }
  }, [theme, isMuted, volume])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.className = newTheme
    setOpen(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error))
      } else {
        audioRef.current.pause()
      }
    }
  }

  const ThemeButton = (
    <Button variant="ghost" size="icon" className="fixed text-accent top-4 left-4 z-50 backdrop-blur-md rounded-full bg-muted/30  hover:bg-muted/50 border-none">
      <Palette className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )

  const ThemeOptions = (
    <div className="flex flex-wrap justify-center gap-2">
      {themes.map((t) => (
        <Button
          key={t.value}
          onClick={() => handleThemeChange(t.value)}
          className="hover:bg-accent/20 rounded-full text-foreground"
          variant="ghost"
        >
          {t.name}
        </Button>
      ))}
    </div>
  )

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {ThemeButton}
        </SheetTrigger>
        <SheetContent side="top" className="w-full sm:max-w-none bg-card/80 max-h-[50vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">Choose a theme</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {ThemeOptions}
          </div>
        </SheetContent>
      </Sheet>
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-accent backdrop-blur-md rounded-full bg-card/40 hover:bg-card/10 border-none"
        >
          {isMuted ? (
            <VolumeX className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Volume2 className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle music</span>
        </Button>
        <audio ref={audioRef} loop />
      </div>
    </>
  )
}