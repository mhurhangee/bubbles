import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

type Question = {
  question: string;
  options: string[];
};

const summarySchema = z.object({
  summary: z.string().describe('A concise yet insightful summary of the user\'s answers.'),
  tasks: z.array(z.string()).min(1).max(5).describe('1-5 recommended mindful tasks based on the user\'s answers'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { questions, answers } = body

  // Ensure questions is an array of Question objects
  const formattedQuestions: Question[] = Array.isArray(questions) 
    ? questions.map((q, index) => ({
        question: typeof q === 'string' ? q : q.text,
        options: answers[index + 1] || []
      }))
    : []

  const prompt = `
  # CONTEXT  
  You are an AI mindfulness coach providing a summary of the user's responses to reflective questions. Your task is to provide a concise yet insightful summary of the user's answers and suggest 1-5 mindful tasks based on their responses.

  # GUIDELINES  
  - **Focus**: Summary should be concise, thought-provoking, and encourage self-reflection.  
  - **Tone**: Positive, constructive, and non-invasive.  
  - **Topics**: Cover a wide variety of mindfulness, self-care, and personal growth themes.  
  - **Tasks**: Provide 1-5 relevant tasks or goal objectives for the user to try to promote mindfulness and wellbeing.
  - **Balanced**: Address both positive and challenging aspects of the user's responses.
  
  **Avoid**:   
  - Overly personal or invasive content. 
  - Really specific or pushy tasks, objectives or suggestions.
  
  # QUESTIONS AND ANSWERS  
  ${formattedQuestions.map((q, index) => `
  ${index + 1}. Q: ${q.question}  
     A: ${q.options.join(", ") || "No answer provided"}  
  `).join("\n")}
  
  # TASK  
  Based on the user's responses, provide a concise summary of their mindfulness journey and suggest 1-5 mindful tasks they could try.
  `;

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: summarySchema,
      prompt,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
