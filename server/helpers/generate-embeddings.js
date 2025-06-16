import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//TODO: change embeddings model
//Generate embeddings for a given text input to enable semantic search and similarity matching.
export async function generateEmbedding(textInput) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: textInput,
    encoding_format: "float",
    dimensions: 256,
  });
    
  return embedding.data[0].embedding;
}