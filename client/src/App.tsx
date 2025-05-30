import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import type { Book } from "./types/types";
import { BookCard } from "./components/BookCard";
import { BookReviewCard } from "./components/BookCardReview";

export default function App() {
  const [bookSearch, setBookSearch] = useState<string>("");
  const [bookReview, setBookReview] = useState<string>("");
  const [bookTitles, setBookTitles] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookPredictions, setBookPredictions] = useState<Book[]>([]);

  const MAX_RESULTS = "5";
  const PRINT_TYPE = "books";
  const LANGUAGE = "en";
  const bookQuery = "a book about dragons and dragon riders";

  function handleSelectedBook(theBook: Book) {
    setSelectedBook(theBook);
  }

  async function handleNextBook() {
    const res = await fetch("http://localhost:3000/findNewBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user001",
      }),
    });
    if (!res.ok) {
      console.error("Failed to search for next book");
      return;
    }
  }

  async function handleReview(review: string) {
    const res = await fetch("http://localhost:3000/addReview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book: selectedBook,
        review: review,
        rating: 5,
      }),
    });
    if (!res.ok) {
      console.error("Failed to submit review");
      return;
    }
  }

  async function fetchData() {
    try {
      console.log("Searching for:", bookQuery);

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          bookQuery
        )}&maxResults=3&printType=books&langRestrict=en&source=web`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      const books = (data.items || []).map((item: any) => {
        const info = item.volumeInfo;

        const book: Book = {
          title: info.title || "Untitled",
          authors: info.authors || ["Unknown"],
          categories: info.categories || ["Uncategorized"],
          pageCount: info.pageCount || 0,
          description: info.description || "No description available.",
          image: {
            smallThumbnail:
              info.imageLinks?.smallThumbnail ||
              "https://via.placeholder.com/128x192?text=No+Cover",
            thumbnail:
              info.imageLinks?.thumbnail ||
              "https://via.placeholder.com/200x300?text=No+Cover",
          },
          infoLink: info.infoLink || "#",
        };

        return book;
      });

      console.log(books);
      setBookPredictions(books);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  async function searchBookOnline() {
    try {
      console.log("Searching for:", bookSearch);

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          bookSearch
        )}&maxResults=10&printType=books&langRestrict=en`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      console.log(data);
      const books = (data.items || []).map((item: any) => {
        const info = item.volumeInfo;

        const book: Book = {
          title: info.title || "Untitled",
          authors: info.authors || ["Unknown"],
          categories: info.categories || ["Uncategorized"],
          pageCount: info.pageCount || 0,
          description: info.description || "No description available.",
          image: {
            smallThumbnail:
              info.imageLinks?.smallThumbnail ||
              "https://placehold.co/200x300?text=No+Cover",
            thumbnail:
              info.imageLinks?.thumbnail ||
              "https://placehold.co/200x300?text=No+Cover",
          },
          infoLink: info.infoLink || "#",
        };

        return book;
      });

      console.log(books);
      setBookTitles(books);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  async function handleCompareBook(theBook: Book) {
    const res = await fetch("http://localhost:3000/compareBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book: theBook,
      }),
    });
    if (!res.ok) {
      console.error("Failed to submit review");
      return;
    }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">My Book Agent</h1>
      <div className="flex w-full justify-between items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Boktitle"
            value={bookSearch}
            onChange={(e) => {
              setBookSearch(e.target.value);
            }}
          />
          <Button type="submit" onClick={searchBookOnline}>
            Sök
          </Button>
        </div>
        <Button onClick={handleNextBook}>Hitta min nästa bok!</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bookTitles.map((book, index) => (
          <BookCard
            book={book}
            onSelectClick={() => {
              handleSelectedBook(book);
            }}
            onCompareClick={() => {
              handleCompareBook(book);
            }}
            key={index}
          />
        ))}
      </div>
      {selectedBook && (
        <BookReviewCard book={selectedBook} onSubmitReview={handleReview} />
      )}
    </main>
  );
}
