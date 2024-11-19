'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Question {
  id: number
  text: string[]
  options?: string[]
  type: 'options' | 'text'
}

const initialQuestions: Question[] = [
  { 
    id: 1, 
    text: ["How are you", "feeling today?"],
    options: ["Happy", "Sad", "Anxious", "Excited", "Tired"],
    type: 'options'
  },
  { 
    id: 2, 
    text: ["What's one thing", "you're grateful for?"],
    type: 'text'
  },
  { 
    id: 3, 
    text: ["What's a small goal", "you have for today?"],
    type: 'text'
  }
]

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 1, ease: "easeIn" }
  }
}

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.4, duration: 0.8, ease: "easeOut" }
  })
}

const AnimatedText = ({ children, custom }: { children: React.ReactNode; custom: number }) => (
  <motion.div
    variants={contentVariants}
    initial="hidden"
    animate="visible"
    custom={custom}
  >
    {children}
  </motion.div>
)

export default function CalmForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [questions, setQuestions] = useState(initialQuestions)
  const [answers, setAnswers] = useState<{[key: number]: string[] | string}>({})
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTransition, setShowTransition] = useState<false | 'in' | 'out'>(false)
  const [countdown, setCountdown] = useState(4)
  const [nextQuestionIndex, setNextQuestionIndex] = useState(0)

  const generateNextQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: questions.length + 1,
      text: [`Generated question ${questions.length + 1}`, `part 2`],
      type: Math.random() > 0.5 ? 'options' : 'text',
      options: Math.random() > 0.5 ? ["Option 1", "Option 2", "Option 3"] : undefined
    }
    setQuestions(prev => [...prev, newQuestion])
  }, [questions])

  const nextStep = () => {
    if (currentStep < questions.length) {
      setNextQuestionIndex(currentStep + 1)
      setShowTransition('in')
      setCountdown(4)
    } else {
      generateNextQuestion()
      setNextQuestionIndex(currentStep + 1)
      setShowTransition('in')
      setCountdown(4)
    }
  }

  useEffect(() => {
    if (showTransition) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1
          if (showTransition === 'in') {
            setShowTransition('out')
            return 4
          }
          clearInterval(timer)
          setShowTransition(false)
          setCurrentStep(nextQuestionIndex)
          return 4
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showTransition, nextQuestionIndex])

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleOptionToggle = (questionId: number, option: string) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] as string[] || []
      if (currentAnswers.includes(option)) {
        return { ...prev, [questionId]: currentAnswers.filter(a => a !== option) }
      } else {
        return { ...prev, [questionId]: [...currentAnswers, option] }
      }
    })
  }

  const handleTextChange = (questionId: number, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 to-fuchsia-400 p-4">
      <AnimatePresence mode="wait">
        {showFAQ ? (
          <motion.div
            key="faq"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-center text-gray-700">FAQ</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger>What is this form for?</AccordionTrigger>
                    <AccordionContent>
                      This form is designed to help you reflect on your day and promote mindfulness.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b-0">
                    <AccordionTrigger>How long will this take?</AccordionTrigger>
                    <AccordionContent>
                      The form typically takes about 5-10 minutes to complete, but you can take as much time as you need.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b-0">
                    <AccordionTrigger>Is my data saved?</AccordionTrigger>
                    <AccordionContent>
                      Your responses are not saved or stored. This form is for personal reflection only. Your responses are sent to our servers and to an AI model, but they are not stored, saved or shared with anyone.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline">What this form is not</AccordionTrigger>
                    <AccordionContent className="transition-all duration-300">
                      This form is not a replacement for friends, family, medical or professional support. If you&#39;re struggling, please reach out to a qualified professional or trusted individual for help. Help is available and you are not alone.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                <Button 
                  onClick={() => setShowFAQ(false)}
                  className="ml-2 px-6 py-2 text-lg bg-purple-700 text-gray-100 hover:bg-purple-200 transition-all duration-300 rounded-full "
                >
                  Back to Form
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : showTransition ? (
          <motion.div
            key="transition"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={showTransition}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl text-gray-700 mb-4"
                  >
                    Breathe {showTransition}
                  </motion.p>
                </AnimatePresence>
                <p className="text-6xl text-purple-700">
                  {countdown}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-center text-gray-700">
                  <AnimatedText custom={0}>
                    {currentStep === 0 ? "Welcome" : `Question ${currentStep}`}
                  </AnimatedText>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center p-8">
                {currentStep === 0 ? (
                  <AnimatedText custom={1}>
                    <p className="text-xl text-gray-600 leading-relaxed mb-4">
                      Take a moment for self reflection.
                    </p>
                  </AnimatedText>
                ) : (
                  <>
                    <AnimatedText custom={1}>
                      <p className="text-2xl text-gray-700 mb-2">{questions[currentStep - 1].text[0]}</p>
                    </AnimatedText>
                    <AnimatedText custom={2}>
                      <p className="text-2xl text-gray-700 mb-6">{questions[currentStep - 1].text[1]}</p>
                    </AnimatedText>
                    <AnimatedText custom={3}>
                      {questions[currentStep - 1].type === 'options' && questions[currentStep - 1].options && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {questions[currentStep - 1].options?.map((option, index) => (
                            <Toggle
                              key={index}
                              pressed={answers[currentStep]?.includes(option)}
                              onPressedChange={() => handleOptionToggle(currentStep, option)}
                              className="bg-white/30 hover:bg-white/50 data-[state=on]:bg-purple-200 data-[state=on]:text-purple-700"
                            >
                              {option}
                            </Toggle>
                          ))}
                        </div>
                      )}
                      {questions[currentStep - 1].type === 'text' && (
                        <input
                          className="mt-4 w-full bg-white/30 backdrop-blur-sm border-gray-200 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-200 transition-all duration-300 rounded-full"
                          placeholder="Type your answer here..."
                          value={answers[currentStep] as string || ''}
                          onChange={(e) => handleTextChange(currentStep, e.target.value)}
                        />
                      )}
                    </AnimatedText>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-center space-x-4 pb-8">
                <AnimatedText custom={4}>
                  {currentStep > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={prevStep} 
                      className="mr-2 px-6 py-2 text-lg bg-white/20 text-purple-700 hover:bg-pink-200 transition-all duration-300 rounded-full "
                    >
                      Back
                    </Button>
                  )}
                  {currentStep === 0 ? (
                    <div className="flex justify-between w-full">
                      <Button 
                        onClick={() => setShowFAQ(true)}
                        className="mr-2 px-6 py-2 text-lg bg-white/20 border text-purple-700 hover:bg-pink-200 transition-all duration-300 rounded-full "
                      >
                        About
                      </Button>
                      <Button 
                        onClick={nextStep}
                        className="ml-2 px-6 py-2 text-lg bg-purple-700 text-gray-100 hover:bg-purple-200 transition-all duration-300 rounded-full "
                      >
                        Begin
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={nextStep}
                      className="ml-2 px-6 py-2 text-lg bg-purple-700 text-gray-100  hover:bg-purple-200 transition-all duration-300 rounded-full "
                    >
                      Next
                    </Button>
                  )}
                </AnimatedText>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}