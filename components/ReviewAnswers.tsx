'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Pencil, Save } from 'lucide-react'
import jsPDF from 'jspdf'

interface ReviewAnswersProps {
  questions: { id: number; text: string }[]
  answers: { [key: number]: string[] }
  summary: {
    summary: string;
    tasks: string[];
  }
  onClose: () => void
  onReset: () => void
}

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

export default function ReviewAnswers({ questions, answers, summary, onClose, onReset }: ReviewAnswersProps) {
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null)
  const [editedAnswers, setEditedAnswers] = useState({ ...answers })

  const answeredQuestions = useMemo(() => {
    const answeredIds = Object.keys(answers).map(Number)
    return questions.filter(q => answeredIds.includes(q.id))
  }, [questions, answers])

  const handleEdit = (questionId: number) => {
    setEditingAnswer(questionId)
  }

  const handleSaveEdit = (questionId: number) => {
    setEditingAnswer(null)
  }

  const handleInputChange = (questionId: number, value: string) => {
    setEditedAnswers(prev => ({
      ...prev,
      [questionId]: [value]
    }))
  }

  const saveToPDF = () => {
    const pdf = new jsPDF()
    let yOffset = 20

    // Get current date and format it
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    pdf.setFontSize(20)
    pdf.text('Your Mindfulness Journey', 105, yOffset, { align: 'center' })
    yOffset += 10

    pdf.setFontSize(12)
    pdf.text(currentDate, 105, yOffset, { align: 'center' })
    yOffset += 15

    pdf.setFontSize(12)
    pdf.setFont("Arial", 'bold')
    pdf.text('Summary:', 15, yOffset)
    yOffset += 10

    pdf.setFont("Arial", 'normal')
    const summaryLines = pdf.splitTextToSize(summary.summary, 180)
    pdf.text(summaryLines, 15, yOffset)
    yOffset += summaryLines.length * 7 + 10

    if (summary.tasks.length > 0) {
      pdf.setFont("Arial", 'bold')
      pdf.text('Suggested Tasks:', 15, yOffset)
      yOffset += 10

      pdf.setFont("Arial", 'normal')
      summary.tasks.forEach((task, index) => {
        const taskLines = pdf.splitTextToSize(`${index + 1}. ${task}`, 170)
        pdf.text(taskLines, 25, yOffset)
        yOffset += taskLines.length * 7 + 5
      })
      yOffset += 10
    }

    answeredQuestions.forEach((question, index) => {
      if (yOffset > 270) {
        pdf.addPage()
        yOffset = 20
      }

      pdf.setFont("Arial", 'bold')
      const questionLines = pdf.splitTextToSize(`Q${index + 1}: ${question.text}`, 180)
      pdf.text(questionLines, 15, yOffset)
      yOffset += questionLines.length * 7

      pdf.setFont("Arial", 'normal')
      const answer = editedAnswers[question.id]?.join(', ') || 'No answer provided'
      const answerLines = pdf.splitTextToSize(`A: ${answer}`, 180)
      pdf.text(answerLines, 15, yOffset)
      yOffset += answerLines.length * 7 + 10
    })

    pdf.save('mindfulness_journey.pdf')
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md"
    >
      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-foreground font-serif">Your Mindfulness Journey</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Summary</h3>
            <p className="text-sm text-foreground/80">{summary.summary}</p>
          </div>
          {summary.tasks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Suggested Tasks</h3>
              <ul className="list-disc list-inside">
                {summary.tasks.map((task, index) => (
                  <li key={index} className="text-sm text-foreground/80">{task}</li>
                ))}
              </ul>
            </div>
          )}
          <ScrollArea className="h-[50vh] pr-4" id="answers-to-save">
            {answeredQuestions.map((question) => (
              <div key={question.id} className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-foreground">{question.text}</h3>
                {editingAnswer === question.id ? (
                  <div className="flex items-center">
                    <Input
                      value={editedAnswers[question.id]?.[0] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="flex-grow mr-2"
                    />
                    <Button onClick={() => handleSaveEdit(question.id)} size="icon" variant="ghost">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                    <p className="text-sm text-foreground/80">
                      {editedAnswers[question.id]?.join(', ') || 'No answer provided'}
                    </p>
                    <Button onClick={() => handleEdit(question.id)} size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4 pb-6">
          <Button 
            onClick={() => {
              onReset();
              onClose();
            }}
            className="px-6 py-2 text-lg bg-muted/30 text-accent hover:bg-muted/50 transition-all duration-300 rounded-full"
          >
            Go to Home
          </Button>
          <Button 
            onClick={saveToPDF}
            className="px-6 py-2 text-lg bg-accent text-muted hover:bg-accent/80 transition-all duration-300 rounded-full"
          >
            Save as PDF
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}