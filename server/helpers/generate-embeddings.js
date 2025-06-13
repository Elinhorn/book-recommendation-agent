import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//TODO: change embeddings model
export async function generateEmbedding(textInput) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: textInput,
    encoding_format: "float",
  });
    //console.log(embedding.data[0].embedding)
  return embedding.data[0].embedding;
}