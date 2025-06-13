import OpenAI from "openai";
import dotenv from "dotenv";


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLLMInterpretation(inputBook, similarBook) {
  const systemPrompt = `You're a literary expert comparing book descriptions. Your job is to explain how two books are similar or different in terms of genre, theme, tone, and target audience.`;

  //TODO: add user review to compare books prompt
  const userPrompt = `
    Book 1:
    Title: ${inputBook.title}
    Description: ${inputBook.description}

    Book 2:
    Title: ${similarBook.title}
    Description: ${similarBook.description}

    Based on their descriptions, analyze how these books relate. Mention shared themes or differences in tone or content. Be concise and insightful. Answer in Swedish.
    `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  return completion.choices[0].message.content;
}

