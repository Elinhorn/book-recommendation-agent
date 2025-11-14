import express from "express";
import cors from "cors";
import { generateEmbedding } from "./helpers/generate-embeddings.js";
import {
  fetchAllBooksFromDatabase,
  fetchAllBooksWithEmbeddings,
  fetchAllNotReadBooksFromDatabase,
  saveBookToNotRead,
  storeBookReview,
  unsaveBookFromNotRead,
  updateBookReview,
} from "./helpers/supabase.js";
import { getTopSimilarBooks } from "./helpers/calculations.js";
import { generateLLMInterpretation } from "./helpers/llm.js";
import { run } from "@openai/agents";
import { agent } from "./helpers/agent.js";
import { generateReadingProfile } from "./helpers/langchain.js";
import { fetchUserBooksLight } from "./helpers/supabase.js";


const userMemoryCache = new Map();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    await updateUserCache();

    res.json({ ok: true });
    console.log("book added");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process review." });
  }
});

// update user book review in database/supabase with embeddings of review
app.post("/updateReview", async (req, res) => {
  const { id, review, rating } = req.body;


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

    await updateUserCache();

    res.json({ ok: true });
    console.log("Review updated");
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
    const topMatches = getTopSimilarBooks(
      newDescriptionEmbedding,
      storedBooks,
      3
    );


    const llmComparison = await generateLLMInterpretation(book, topMatches[0]);

    res.json({
      match: topMatches[0],
      answer: llmComparison,
      
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process review." });
  }
});


// calls AI agent to find new books based on users reading profile (a short sumamry of the books read) 
// returns a list of recommended books and short summary for each book
app.post("/findNewBook", async (req, res) => {
  try {
    let userProfile;
    
    if (userMemoryCache.has('userProfile')) {
      console.log('Using cached user profile');
      userProfile = userMemoryCache.get('userProfile');
    } else {
      console.log('Generating new user profile...');
      const userBooks = await fetchAllBooksFromDatabase();      
      userProfile = await generateReadingProfile(userBooks);
      userMemoryCache.set('userProfile', userProfile);
    }

    const result = await run(
      agent,
      `Användarens bokprofil:
       Titel: ${userProfile.title}
       Sammanfattning: ${userProfile.summary}

       Skapa en Google Books-sökfråga baserat på denna profil. 
       Returnera tre böcker med korta sammanfattningar. Svara alltid på svenska.`
    ); 


    const output = result.finalOutput;
    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent run failed." });
  }
});

// refreshes the user reading profile when reviews are added or updated
// fetch latest user books and regenerate AI profile to keep cache current 
async function updateUserCache() {
  const books = await fetchUserBooksLight();
  
  
  const userProfile = await generateReadingProfile(books);
  userMemoryCache.set('userProfile', userProfile);

}

// fetch all user books from database/supabase
app.get("/myBooks", async (req, res) => {
  try {
    const result = await fetchAllBooksFromDatabase();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent run failed." });
  }
});

// fetch user's saved "want to read" books from database
app.get("/notReadBooks", async (req, res) => {
  try {
    const result = await fetchAllNotReadBooksFromDatabase();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent run failed." });
  }
});

// Save or delete 'want to read book' from database
app.post("/notReadBooksToggle", async (req, res) => {
  const { book, action } = req.body;

  if (!book || !book.title) {
    return res.status(400).json({ error: "Book data is required" });
  }

  try {
    if (action === "save") {
      await saveBookToNotRead(book);
      res.json({ ok: true, saved: true });
    } else if (action === "unsave") {
      await unsaveBookFromNotRead(book.infoLink);
      res.json({ ok: true, saved: false });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    console.error("Error toggling saved book:", err);
    res.status(500).json({ error: "Failed to toggle saved book" });
  }
});


// Generate AI reading profile based on  user read books and cache it 
app.get("/getUserProfile", async (req, res) => {
  try {
    let userProfile;
    
    // Check if we have a cached user profile
    if (userMemoryCache.has('userProfile')) {
      console.log('Using cached user profile');
      userProfile = userMemoryCache.get('userProfile');
    } else {
      console.log('Generating new user profile...');
      const result = await fetchAllBooksFromDatabase();
      userProfile = await generateReadingProfile(result);
      userMemoryCache.set('userProfile', userProfile);
    }

    console.log("User profile:", userProfile);
    res.json(userProfile);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent run failed." });
  }
});

// use agent to find similar books by the choosen book  title and auther
// agent create querys to search on Google Book API for similar books
app.post("/recommendSimilar", async (req, res) => {
  const { title, authors } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Book title is required" });
  }

  if (!authors) {
    return res.status(400).json({ error: "Book authors is required" });
  }

  const allAuthors = authors.join();

  try {
    const result = await run(
      agent,
      `Rekommendera böcker som är liknande ${title} skriven av ${allAuthors} med hjälp av Google Books. 
       Returnera tre liknande böcker med korta sammanfattningar. Svara alltid på svenska.`
    );

    res.json(result.finalOutput);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get similar books." });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
