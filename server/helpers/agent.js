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
    console.log("Fetched books:", books.length);

    return {
      books,
    };
  },
});

export const agent = new Agent({
  name: "Book Assistant",
  instructions: `
  You are a helpful book assistant. 
  First, call "get_user_books" to get all books the user has reviewed.
  Analyze their titles, reviews, and categories.
  Then create a search query based on the user's favorite genres, topics, or styles.
  Call "search_book_api" using that query.
  Then generate a helpful summary of the recommended books.
  Return both the list and a concise summary.
  Only return top 3 books based on the user's preferences and previous reviews.
  Always answer in Swedish.
 `,
  model: "o4-mini",
  outputType: BooksResponse,
  tools: [searchBookApi, getUserBooks],
  maxIterations: 3,
});
