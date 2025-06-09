import OpenAI from "openai";
import dotenv from "dotenv";
import e from "express";

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

    Based on their descriptions, analyze how these books relate. Mention shared themes or differences in tone or content. Be concise and insightful.
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

export async function generateSummaryOfBooks(books) {
    if (!books || books.length === 0) {
        return "No books available to summarize.";
    }
    console.log("gen summary of books", books.length);
    const systemPrompt = `You are a book summarizer. Your task is to provide a concise summary of the following books, highlighting their main themes, genres, and unique features.`;
    const userPrompt = books.map((book, index) => `
        Book ${index + 1}:
        Title: ${book.title}
        Authors: ${book.authors.join(", ")}
        Categories: ${book.categories.join(", ")}
        Description: ${book.description}
    `).join("\n\n");
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