import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

type Question = {
  question: string;
  options: string[];
};

const questionSchema = z.object({
  question: z.string().describe('A single, question for self-reflection and mindfulness.'),
  options: z.array(z.string()).min(3).max(8).describe('5 to 8 answer options for the question'),
})

const exampleQuestions: Question[] = [
  { question: "What time did you wake up today?", options: ["Morning", "Afternoon", "Evening", "I don't remember", "Not sure"] },
  { question: "Have you taken any wellness actions today?", options: ["Exercised", "Meditated", "Journaling", "None yet", "Not sure"] },
  { question: "How would you describe your energy level today?", options: ["High", "Balanced", "Fluctuating", "Low", "Exhausted", "Not sure"] },
  { question: "Which meal did you enjoy the most today?", options: ["Breakfast", "Lunch", "Dinner", "Snacks", "None", "Not sure"] },
  { question: "Have you focused on gratitude today?", options: ["Yes", "Not yet", "No", "Not sure"] },
  { question: "How much time did you spend outdoors today?", options: ["None", "<15 mins", "15-30 mins", ">1 hour", "Not sure"] },
  { question: "Did you interact with anyone today?", options: ["Yes, meaningful", "Yes, casual", "No", "Not sure"] },
  { question: "What is one positive moment you experienced today?", options: ["Achievement", "Interaction", "Peace", "None", "Not sure"] },
  { question: "What challenge did you face today?", options: ["Managing emotions", "Staying motivated", "None", "Not sure"] },
  { question: "How mindful were you during your activities today?", options: ["Very mindful", "Neutral", "Distracted", "Not sure"] },
  { question: "Did you dedicate time to self-care today?", options: ["Yes, a lot", "Yes, but not enough", "No", "Not sure"] },
  { question: "How did you manage stress today?", options: ["Relaxation", "Exercise", "Distraction", "I struggled", "Not sure"] },
  { question: "What is one thing you're proud of from today?", options: ["Task", "Kindness", "Challenge", "None", "Not sure"] },
  { question: "What inspired you today?", options: ["A person", "An idea", "Art", "Nothing", "Not sure"] },
  { question: "What is something you're looking forward to tomorrow?", options: ["Goal", "Event", "Relaxation", "Nothing", "Not sure"] },
  { question: "How did you nurture your mental health today?", options: ["Meditation", "Therapy", "Talking", "None", "Not sure"] },
  { question: "Did you try something new today?", options: ["Yes, activity", "Yes, food", "No", "Not sure"] },
  { question: "What is one thing you're grateful for today?", options: ["Person", "Opportunity", "Experience", "None", "Not sure"] },
  { question: "What time did you eat breakfast?", options: ["Morning", "Afternoon", "Skipped", "Not sure"] },
  { question: "What did you snack on today?", options: ["Healthy", "Unhealthy", "Nothing", "Not sure"] },
  { question: "Did you leave the house today?", options: ["Yes", "No", "Not sure"] },
  { question: "How did you travel today?", options: ["Walk", "Car", "Bike", "Other", "Not sure"] },
  { question: "What did you notice on your journey?", options: ["Nature", "People", "Nothing stood out", "Not sure"] },
  { question: "Did you work today?", options: ["Yes", "No", "Not sure"] },
  { question: "Did you clean anything today?", options: ["Yes", "No", "Not sure"] },
  { question: "Did you feel emotional today?", options: ["Yes, happy", "Yes, sad", "Neutral", "No", "Not sure"] },
  { question: "What is one thing you could improve tomorrow?", options: ["Focus", "Energy", "Mindfulness", "Nothing", "Not sure"] },
  { question: "What was your biggest achievement today?", options: ["Task", "Kindness", "Overcoming a challenge", "Nothing", "Not sure"] },
  { question: "What was your biggest frustration today?", options: ["Work", "Personal", "Other", "None", "Not sure"] },
  { question: "What did you find most useful today?", options: ["Advice", "Tools", "Other", "Nothing", "Not sure"] },
  { question: "What did you create today?", options: ["Art", "Food", "Idea", "Nothing", "Not sure"] },
  { question: "How well did you sleep last night?", options: ["Very well", "Neutral", "Poorly", "Not sure"] },
  { question: "Did you experience joy today?", options: ["Yes", "No", "Not sure"] },
  { question: "What is your intention for tomorrow?", options: ["Focus", "Rest", "Mindfulness", "Not sure"] },
  { question: "Did you make progress on a goal today?", options: ["Yes", "No", "Not sure"] },
  { question: "What time did you eat dinner?", options: ["Evening", "Skipped", "Not sure"] },
  { question: "Did you encounter a challenge today?", options: ["Yes", "No", "Not sure"] },
  { question: "What surprised you today?", options: ["A person", "An event", "Nothing", "Not sure"] },
  { question: "What would you like to achieve by next week?", options: ["Goal", "Skill", "Mindset", "Not sure"] },
  { question: "What is your priority this month?", options: ["Work", "Health", "Connection", "Not sure"] },
  { question: "How did you connect with nature today?", options: ["Walk", "Meditation", "Nothing", "Not sure"] },
  { question: "Did you engage in any creative activities today?", options: ["Yes", "No", "Not sure"] },
  { question: "What made you smile today?", options: ["A person", "An event", "Other", "Nothing", "Not sure"] },
];

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { previousQuestions, previousAnswers } = body

  // Ensure previousQuestions is an array of Question objects
  const questions: Question[] = Array.isArray(previousQuestions) 
    ? previousQuestions.map((q, index) => ({
        question: typeof q === 'string' ? q : q.text,
        options: previousAnswers[index + 1] || []
      }))
    : []

  const prompt = `
  # CONTEXT  
  You are an AI mindfulness coach providing reflective questions to help users cultivate self-awareness and well-being. Your task is to generate a new reflective question and relevant answer options for a mindfulness app.
  
  # GUIDELINES  
  - **Focus**: Questions should be concise, thought-provoking, and encourage self-reflection.  
  - **Tone**: Positive, constructive, and non-invasive.  
  - **Topics**: Cover a wide variety of mindfulness, self-care, and personal growth themes.  
  - **Options**: Provide 3-8 relevant answer options, including at least one neutral or non-committal choice (e.g., "Not sure").
  - **Balanced**: Include questions that address both positive and challenging aspects of daily life.  
  - **Follow-up**: You should ask follow-up questions based on user responses to deepen self-awareness and explore a certain topic further. This, however, should be balanced with new questions and topics so as not to dwell too much on one topic.
  
  **Avoid**:  
  - Needless repetition of existing questions or topics.  
  - Overly personal or invasive content.  
  
  # PREVIOUS QUESTIONS AND ANSWERS  
  The first five questions below are the most important and assist in setting the context for the user's reflection.
  
  ## Priority Questions  
  ${questions.slice(0, 5).map((q, index) => `
  ${index + 1}. Q: ${q.question}  
     A: ${q.options.join(", ") || "No answers provided"}  
  `).join("\n")}
  
  ## Additional Questions 
  These questions are from previous sessions and should be considered when generating new questions.
  ${questions.slice(5).map((q, index) => `
  ${index + 6}. Q: ${q.question}
     A: ${q.options.join(", ") || "No answers provided"}
  `).join("\n")}
  
  # EXAMPLE QUESTIONS AND OPTIONS  
  
  ${exampleQuestions
    .sort(() => Math.random() - 0.5) 
    .slice(0, 10)
    .map(q => `Q: ${q.question}\nOptions: ${q.options.join(", ")}`)
    .join("\n\n")}
  
  # TASK  
  Generate one new reflective question and include 3-8 concise and relevant answer options.
  `;
  
  console.log('Prompt:', prompt)

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: questionSchema,
      prompt,
    })

    return NextResponse.json({ question: object })
  } catch (error) {
    console.error('Error generating question:', error)
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}