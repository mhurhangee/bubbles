"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Palette } from 'lucide-react'

const themes = [
  { name: 'Pastel', value: 'pastel' },
  { name: 'Forest', value: 'forest' },
  { name: 'Aurora', value: 'aurora' },
  { name: 'Campfire', value: 'campfire' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Midnight', value: 'midnight' },
  { name: 'Desert', value: 'desert' },
  { name: 'Galaxy', value: 'galaxy' },
]

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('pastel')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'pastel'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.className = newTheme
    setOpen(false)
  }

  const ThemeButton = (
    <Button variant="outline" size="icon" className="fixed text-accent top-4 left-4 z-50 backdrop-blur-md rounded-full bg-card/40">
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
          className="hover:bg-accent/20 rounded-full"
          variant="ghost"
        >
          {t.name}
        </Button>
      ))}
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {ThemeButton}
      </SheetTrigger>
      <SheetContent side="top" className="w-full sm:max-w-none bg-card max-h-[50vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Choose a theme</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {ThemeOptions}
        </div>
      </SheetContent>
    </Sheet>
  )
}