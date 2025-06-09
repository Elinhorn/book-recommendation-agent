import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { generateEmbedding } from "./helpers/generate-embeddings.js";
import { fetchAllBooksWithEmbeddings, storeBookReview } from "./helpers/supabase.js";
import { getTopSimilarBooks } from "./helpers/calculations.js";
import { generateLLMInterpretation } from "./helpers/llm.js";
import { run } from '@openai/agents';
import { agent } from "./helpers/agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //????

app.post("/addReview", async (req, res) => {
  const { book, review, rating } = req.body;

  if (!review || !review.trim()) {
    return res.status(400).json({ error: "Review is required" });
  }

  try {
    const review_embedding = await generateEmbedding(review);
    const description_embedding = await generateEmbedding(book.description);

    await storeBookReview({
      book,
      review,
      rating,
      review_embedding,
      description_embedding, 
    });

    res.json({ ok: true });
    console.log('book added')
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process review." });
  }
});

app.post("/compareBook", async (req, res) => {
  const { book } = req.body;

  if (!book.description || !book.description.trim()) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const newDescriptionEmbedding = await generateEmbedding(book.description);

    const storedBooks = await fetchAllBooksWithEmbeddings();
    const topMatches = getTopSimilarBooks(newDescriptionEmbedding, storedBooks, 3);

    console.log('new book: ', book)
    console.log('new book: ', topMatches)

    //could add review for my book
    //if books are not similar, maybe search for other book!?
    const llmComparison = await generateLLMInterpretation(book, topMatches[0])

    res.json({
        match: topMatches[0],
        answer: llmComparison,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process review." });
  }
});

app.post("/findNewBook", async (req, res) => {
  
  try {

    // Step 1: Get all user book reviews from superbase
    // Step 2: LLM Generate a profile based on users review
    // Step 3: LLM search on google book api based on what user would like
    // Step 4: Retrives 3 books with explanintion why user would like the book

    const result = await run(
    agent,
    'Get users book reviews and find new books based on their preferences.',
    )

    //add llm interpretation of the books

    const output = result.finalOutput; // this contains your { books: [...] }

    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Agent run failed.' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));