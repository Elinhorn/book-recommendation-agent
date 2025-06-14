import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { generateEmbedding } from "./helpers/generate-embeddings.js";
import { fetchAllBooksFromDatabase, fetchAllBooksWithEmbeddings, storeBookReview, updateBookReview } from "./helpers/supabase.js";
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

// add user book review to database/supabase with embeddings of review description
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

// update user book review in database/supabase with embeddings of review
app.post("/updateReview", async (req, res) => {
  const { id, review, rating } = req.body;

  console.log('updateReview', id)

  if (!id || !review || !review.trim()) {
    return res.status(400).json({ error: "Book ID and review are required" });
  }

  try {
    const review_embedding = await generateEmbedding(review);

    await updateBookReview(id, {
      review,
      rating,
      review_embedding,
    });

    res.json({ ok: true });
    console.log('Review updated');
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to update review." });
  }
});

// generate embedding for book description and compare with existing books in database/supabase
// return top 3 similar books, send most similar book to LLM for interpretation and frontend display
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

// calls AI agent to find new books based on users stored book reviews
// returns a list of recommended books and short summary for each book
app.post("/findNewBook", async (req, res) => {
  
  try {

    const result = await run(
    agent,
    'Get users book reviews and find new books based on their previous books.',
    )

    const output = result.finalOutput; 

    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Agent run failed.' });
  }
});

// fetch all user books from database/supabase
app.get("/myBooks", async (req, res) => {
  
  try {

    const result = await fetchAllBooksFromDatabase();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Agent run failed.' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));