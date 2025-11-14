import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import { fetchAllBooksFromDatabase } from "./supabase.js";

const BookType = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  categories: z.array(z.string()),
  pageCount: z.number(),
  description: z.string(),
  image: z.object({
    smallThumbnail: z.union([z.string(), z.null()]),
    thumbnail: z.union([z.string(), z.null()]),
  }),
  infoLink: z.union([z.string(), z.null()]),
  review: z.union([z.string(), z.null()]),
  rating: z.union([z.number(), z.null()]),
});

const BooksResponse = z.object({
  books: z.array(BookType),
  summary: z.string(),
});

// This tool searches the Google Books API for books based on a query created from the user's previous reviews and preferences.
const searchBookApi = tool({
  name: "search_book_api",
  description: "Search Google Books API by query.",
  parameters: z.object({ query: z.string() }),
  async execute({ query }) {
    console.log("Searching for books in:", query);
    const urlQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${urlQuery}&maxResults=3`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return {
        books: [],
      };
    }

    const books = data.items.map((item) => ({
      title: item.volumeInfo.title || "No title",
      authors: item.volumeInfo.authors || ["Unknown author"],
      categories: item.volumeInfo.categories || ["Uncategorized"],
      pageCount: item.volumeInfo.pageCount || 0,
      description: item.volumeInfo.description || "No description available",
      image: {
        smallThumbnail: item.volumeInfo.imageLinks?.smallThumbnail || "",
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
      },
      infoLink: item.volumeInfo.infoLink || "",
    }));

    return {
      books,
    };
  },
});

// tool to fetches all user's reviewed books from database
const getUserBooks = tool({
  name: "get_user_books",
  description:
    "Fetch all books the user has reviewed from the Supabase database.",
  parameters: z.object({}), 
  async execute() {
    console.log("Fetching user books from database");
    const books = await fetchAllBooksFromDatabase();
    if (!books || books.length === 0) {
      return {
        books: [],
      };
    }

    return {
      books,
    };
  },
});

// tool to finds books similar to a given title using Google Books search
const recommendSimilarBooks = tool({
  name: "recommend_similar_books",
  description: "Given a book title, find similar books from Google Books using the agent's book search tool.",
  parameters: z.object({ title: z.string() }),
  async execute({ title }, agentContext) {
    console.log("Searching for books similar to:", title);

    const searchResult = await agentContext.runTool("search_book_api", { query: title });

    if (!searchResult || !searchResult.books || searchResult.books.length === 0) {
      return { books: [] };
    }

    return { books: searchResult.books.slice(0, 3) };
  },
});


// uses user reading profile to generate personalized book suggestions via Google Books API
export const agent = new Agent({
  name: "Book Assistant",
  instructions: `
   Du är en hjälpsam bokassistent.
    Du får användarens bokprofil som input:
    Titel: {userProfile.title}
    Sammanfattning: {userProfile.summary}

    Skapa en sökfråga för Google Books API baserat på denna profil.
    Returnera de tre mest relevanta böckerna med korta sammanfattningar.
    Svara alltid på svenska.
 `,
  model: "o4-mini",
  outputType: BooksResponse,
  tools: [searchBookApi, getUserBooks, recommendSimilarBooks],
  maxIterations: 3,
});
