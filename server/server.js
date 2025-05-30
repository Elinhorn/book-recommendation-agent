import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { generateEmbedding } from "./helpers/generate-embeddings.js";
import { storeBookReview } from "./helpers/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    //const new_description_embedding = await generateEmbedding(book.description);

    // Step 1: Embed the new book's description
    // Step 2: Retrieve all stored books descriptions/reviews with embeddings from Supabase
    // Step 3: Compare using cosine similarity
    // Step 4: Sort by similarity
    // Step 5: Ask an LLM to interpret the similarity

    res.json({ ok: true });
    console.log('new bok description')
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process review." });
  }
});

app.post("/findNewBook", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {

    // Step 1: Get all user book reviews from superbase
    // Step 2: LLM Generate a profile based on users review
    // Step 3: LLM search on google book api based on what user would like
    // Step 4: Retrives 3 books with explanintion why user would like the book

    res.json({ ok: true });
    console.log('new magic ai search')
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process review." });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));