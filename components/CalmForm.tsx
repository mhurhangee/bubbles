'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ReviewAnswers from "@/components/ReviewAnswers"

interface Question {
  id: number
  text: string
  options: string[]
}

const initialQuestions: Question[] = [
  {
    id: 1,
    text: "What would you like to focus on today?",
    options: ["Emotions", "Energy", "Health", "Productivity", "Self-care", "Relationships", "Mindfulness", "Not sure"],
  },
  {
    id: 2,
    text: "How are you feeling overall today?",
    options: ["Happy", "Sad", "Anxious", "Excited", "Tired", "Calm", "Stressed", "Energetic", "Relaxed", "Frustrated", "Not Sure"],
  },
  {
    id: 3,
    text: "How much time can you dedicate to self-reflection or wellness today?",
    options: ["5 minutes", "10 minutes", "15 minutes", "30 minutes", "1 hour or more", "Not sure"],
  },
  {
    id: 4,
    text: "What's your main intention for today?",
    options: ["Stay calm", "Be productive", "Feel connected", "Rest and recharge", "Practice mindfulness", "Not sure"],
  },
  {
    id: 5,
    text: "How well did you sleep last night?",
    options: ["Very well", "Well", "Neutral", "Poorly", "Very poorly", "I didn't sleep", "Not sure"],
  },
];

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
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({})
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTransition, setShowTransition] = useState<false | 'in' | 'out'>(false)
  const [countdown, setCountdown] = useState(4)
  const [nextQuestionIndex, setNextQuestionIndex] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [showReviewAnswers, setShowReviewAnswers] = useState(false)

  const generateNextQuestion = useCallback(async () => {
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousQuestions: questions.map(q => q.text),
          previousAnswers: answers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate question')
      }

      const data = await response.json()
      const newQuestion: Question = {
        id: questions.length + 1,
        text: data.question.question,
        options: data.question.options,
      }

      setQuestions(prev => [...prev, newQuestion])
    } catch (error) {
      console.error('Error generating question:', error)
      // Fallback to a default question if AI generation fails
      const fallbackQuestion: Question = {
        id: questions.length + 1,
        text: "What's your current state of mind?",
        options: ["Focused", "Distracted", "Calm", "Overwhelmed", "Curious"],
      }
      setQuestions(prev => [...prev, fallbackQuestion])
    }
  }, [questions, answers])

  const nextStep = () => {
    if (currentStep < questions.length) {
      setNextQuestionIndex(currentStep + 1)
      setShowTransition('in')
      setCountdown(5)
    } else {
      generateNextQuestion()
      setNextQuestionIndex(currentStep + 1)
      setShowTransition('in')
      setCountdown(5)
    }

    // Check if it's time to show the review
    if (currentStep >= 10 && (currentStep - 10) % 5 === 0) {
      setShowReview(true)
    }
  }

  useEffect(() => {
    if (showTransition) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1
          if (showTransition === 'in') {
            setShowTransition('out')
            return 5
          }
          clearInterval(timer)
          setShowTransition(false)
          setCurrentStep(nextQuestionIndex)
          return 5
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
      const currentAnswers = prev[questionId] || []
      if (currentAnswers.includes(option)) {
        return { ...prev, [questionId]: currentAnswers.filter(a => a !== option) }
      } else {
        return { ...prev, [questionId]: [...currentAnswers, option] }
      }
    })
  }

  const resetForm = () => {
    setCurrentStep(0);
    setQuestions(initialQuestions);
    setAnswers({});
    setShowFAQ(false);
    setShowTransition(false);
    setCountdown(5);
    setNextQuestionIndex(0);
    setShowReview(false);
    setShowReviewAnswers(false);
  }

  const renderReviewOptions = () => (
    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="text-3xl text-center text-foreground font-serif">Review Your Answers</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <p className="text-foreground/90 mb-4">Would you like to finish and review your answers or continue?</p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => {
              setShowReviewAnswers(true);
              setShowReview(false);
            }}
            className="px-6 py-2 text-lg bg-accent text-muted hover:bg-accent/80 transition-all duration-300 rounded-full border-none"
          >
            Review Answers
          </Button>
          <Button
            onClick={() => setShowReview(false)}
            className="px-6 py-2 text-lg bg-muted/30  text-accent hover:bg-muted/50 transition-all duration-300 rounded-full border-none"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
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
            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-center text-foreground">FAQ</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className='text-foreground'>
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
                      This form is not a replacement for friends, family, medical or professional support. If you're struggling, please reach out to a qualified professional or trusted individual for help. Help is available and you are not alone.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                <Button
                  onClick={() => setShowFAQ(false)}
                  className="ml-2 px-6 py-2 text-lg bg-accent text-muted hover:bg-accent/80 transition-all duration-300 rounded-full border-none"
                >
                  Back to Form
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : showReview ? (
          <motion.div
            key="review"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            {renderReviewOptions()}
          </motion.div>
        ) : showReviewAnswers ? (
          <ReviewAnswers
            questions={questions}
            answers={answers}
            onClose={() => setShowReviewAnswers(false)}
            onReset={resetForm}
          />
        ) : showTransition ? (
          <motion.div
            key="transition"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={showTransition}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl text-foreground mb-4 font-serif"
                  >
                    Breathe {showTransition}
                  </motion.p>
                </AnimatePresence>
                <p className="text-6xl text-accent">
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
            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-3xl">
              <CardContent className="text-center p-8">
              <AnimatedText custom={0} >
                    <div className='text-3xl text-center text-foreground font-serif pb-2'>{currentStep === 0 ? "Welcome" : undefined}</div>
                  </AnimatedText>
                {currentStep === 0 ? (
                  <AnimatedText custom={1}>
                    <p className="text-xl text-foreground/80 leading-relaxed mb-4">
                      Take a moment for self reflection.
                    </p>
                  </AnimatedText>
                ) : (
                  <>
                    <AnimatedText custom={1}>
                      <p className="text-2xl text-foreground mb-6">{questions[currentStep - 1].text}</p>
                    </AnimatedText>
                    <AnimatedText custom={3}>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {questions[currentStep - 1].options.map((option, index) => (
                          <Toggle
                            key={index}
                            pressed={answers[currentStep]?.includes(option)}
                            onPressedChange={() => handleOptionToggle(currentStep, option)}
                            className="bg-muted/30 hover:bg-muted/50 data-[state=on]:bg-accent/20 data-[state=on]:text-accent data-[state=on]:border border-accent rounded-full px-4 mx-1 text-foreground"
                          >
                            {option}
                          </Toggle>
                        ))}
                      </div>
                    </AnimatedText>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-center space-x-4 pb-8">
                <AnimatedText custom={4}>
                  {currentStep > 0 && (
                    <Button
                      onClick={prevStep}
                      className="mr-2 px-6 py-2 text-lg bg-muted/30  text-accent hover:bg-muted/50 hover:text-accent transition-all duration-300 rounded-full "
                    >
                      Back
                    </Button>
                  )}
                  {currentStep === 0 ? (
                    <div className="flex justify-between w-full">
                      <Button
                        onClick={() => setShowFAQ(true)}
                        className="mr-2 px-6 py-2 text-lg bg-muted/30 text-accent hover:bg-muted/50 hover:text-accent transition-all duration-300 rounded-full "
                      >
                        About
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="ml-2 px-6 py-2 text-lg bg-accent text-muted hover:bg-accent/80 transition-all duration-300 rounded-full "
                      >
                        Begin
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={nextStep}
                      className="ml-2 px-6 py-2 text-lg bg-accent text-muted hover:bg-accent/80 transition-all duration-300 rounded-full shadow-lg"
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