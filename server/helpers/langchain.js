import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

// define the expected JSON structure for reading profile output
const parser = StructuredOutputParser.fromNamesAndDescriptions({
	title: "The title of the profile",
	summary: "A short, funny description of the profile",
});

// get formatting instructions for the AI model
const formatInstructions = parser.getFormatInstructions();

// openAI model config for creative profile generation
const model = new ChatOpenAI({
	model: "gpt-4o-mini",
	temperature: 0.7, //high temp for more creativity 
});

// prompt template for generating funny reading personalities
const prompt = PromptTemplate.fromTemplate(`
Du är en AI-bokguru.
Ditt uppdrag är att analysera vilka böcker användaren har läst och vad de tycker om dem.

Ge ett kort men roligt svar. Här är tre exempel:

Den kaffefläckade filosofen
Markerar alla djupa citat – men glömmer varför fem minuter senare. Älskar böcker som ”får en att tänka”, helst medan du sippar på en kall kopp kaffe du glömt bort. Läser Camus för nöjes skull, men har en hemlig förkärlek för Twilight.

Cliffhanger-junkien
Lever för oväntade vändningar. Sover inte förrän sista kapitlet är klart. Säger att de älskar “litterär fiktion”, men vill egentligen bara att någon ska falla från ett metaforiskt stup var trettionde sida. Har svårt att lita på författare.

Den överambitiösa bokhamstraren
Köper böcker snabbare än hen hinner läsa dem. Äger 47 böcker som är “påbörjade just nu”. Tycker att sortera bokhyllan räknas som läsning. Har en gång använt sin Kindle för att hålla upp en pocketbok.

Returnera svaret endast som JSON enligt följande format:

{format_instructions}

Här är användarens senaste lästa och recenserade böcker:
{books}
`);

// creating LangChain pipeline
const chain = RunnableSequence.from([prompt, model]);

// generate AI reading profile based on user's book reviews
export async function generateReadingProfile(userBooks) {
  try {
    if (!userBooks || !Array.isArray(userBooks) || userBooks.length === 0) {
      throw new Error("No user books provided for profile generation");
    }

    const bookList = userBooks
      .map((b) => `${b.title} - ${b.review || "Ingen recension"}`)
      .join("\n");

    const response = await chain.invoke({
      books: bookList,
      format_instructions: formatInstructions,
    });

    const text = typeof response === "string" ? response : response.content ?? "";

    return parser.parse(text);
    
  } catch (error) {
    console.error("Error generating reading profile:", error);
  }
}
