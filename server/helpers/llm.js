import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLLMInterpretation(inputBook, similarBook) {
  const systemPrompt = `You are a skillful and insightful book expert tasked with providing concise, insightful, and friendly comparisons between books to help users discover new reads. Your analysis should be based on the provided book descriptions, and you must always respond in Swedish.`;

  //TODO: add user review to compare books prompt
  const userPrompt = `
  Carefully analyze the similarities and differences between the new book 
  "${inputBook.title}" by ${inputBook.author} and the user's already read book 
  "${similarBook.title}" by ${similarBook.author}.
  Both books have the following descriptions:
  New book: "${inputBook.description}"
  User's read book: "${similarBook.description}"
  

  Based on this information, write a short and concise text (max 3-4 sentences) explaining:
  What the most important similarities are between these two books (e.g., genre, themes, style, type of characters).
  Why the new book 
  "${inputBook.title}" is likely to suit (or not suit) the user, considering the user's positive experience with 
  "${similarBook.title}" and their similarity score.

  **Always respond in Swedish.**`;


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
