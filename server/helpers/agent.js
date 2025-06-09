import { Agent, tool } from '@openai/agents';
import { z } from 'zod';
import { fetchAllBooksFromDatabase } from './supabase.js';
import { generateSummaryOfBooks } from './llm.js';

const BookType = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  categories: z.array(z.string()),
  pageCount: z.number(),
  description: z.string(),
  image: z.object({
    // required, but can be empty string or null
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

const searchBookApi = tool({
  name: 'search_book_api',
  description: 'Search Google Books API by category.',
  parameters: z.object({ category: z.string() }),
  async execute({ category }) {
    console.log('Searching for books in category:', category);
    const query = encodeURIComponent(category);
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${query}&maxResults=3`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return {
        books: [],
      };
    }

    const books = data.items.map(item => ({
        title: item.volumeInfo.title || 'No title',
        authors: item.volumeInfo.authors || ['Unknown author'],
        categories: item.volumeInfo.categories || ['Uncategorized'],
        pageCount: item.volumeInfo.pageCount || 0,
        description: item.volumeInfo.description || 'No description available',
        image: {
                smallThumbnail: item.volumeInfo.imageLinks?.smallThumbnail || '',
                thumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
        },
        infoLink: item.volumeInfo.infoLink || '',
    }));

    
    return {
      books,
    };
  },
});

const getUserBooks = tool({
  name: 'get_user_books',
  description: 'Fetch all books the user has reviewed from the Supabase database.',
  parameters: z.object({}), // No input needed
  async execute() {
    console.log('Fetching user books from database');
    const books = await fetchAllBooksFromDatabase();
    if (!books || books.length === 0) {
      return {
        books: [],
      };
    }
    console.log('Fetched books:', books.length);
   
    return {
      books
    };
  },
});

export const agent = new Agent({
  name: 'Book Assistant',
  instructions: `
  You are a helpful book assistant. 
  When a user asks for book recommendations, first call the "search_book_api" tool to find books.
  Then using those books to generate a helpful summary.
  Finally, return both the books and the summary.
 `,
  model: 'o4-mini',
  outputType: BooksResponse,
  tools: [searchBookApi, getUserBooks],

});