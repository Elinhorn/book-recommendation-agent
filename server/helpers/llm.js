import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// generate book comparison analysis using OpenAI Responses API
export async function generateLLMInterpretation(book, similarBook) {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `Du är en kunnig och insiktsfull litteraturexpert som hjälper läsare att upptäcka nya böcker. 
          Du skriver alltid på svenska och med en vänlig, engagerande och tydlig ton. 
          När du jämför böcker ska du fokusera på: berättelsens stil och ton, centrala teman och känslor, målgrupp och läsupplevelse. 
          Svara kortfattat (högst 5–6 meningar) och ge alltid en naturlig och lättläst motivering till varför den nya boken kan passa, eller inte passa användaren.
          Undvik tekniskt språk och skriv på ett sätt som väcker läslust.`,
        },
        {
          role: "user",
          content: `
            Jämför följande två böcker och förklara varför de passar samma typ av läsare.
            Fokusera på teman, ton, språk och målgrupp. Håll dit till mellan 5-6 meningar.
            Ny bok: ${book.title} - ${book.description}
            Lik bok: ${similarBook.title} - ${similarBook.description}
          `,
        },
      ],
    });

    return response.output_text;
  } catch (err) {
    console.error("Responses API error:", err);
    return "Kunde inte generera jämförelse för tillfället.";
  }
}