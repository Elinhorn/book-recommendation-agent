import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import type { Book, ComparedBooks } from "./types/types";
import { BookCard } from "./components/BookCard";
import { BookReviewCard } from "./components/BookCardReview";
import CompareBook from "./components/CompareBook";
import FindBook from "./components/FindBook";

export default function App() {
  const [bookSearch, setBookSearch] = useState<string>("");
  const [bookReview, setBookReview] = useState<string>("");
  const [bookTitles, setBookTitles] = useState<Book[]>([]);
  const [comparedBook, setComparedBook] = useState<ComparedBooks | undefined>();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookPredictions, setBookPredictions] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [nextBookOpen, setNextBookOpen] = useState<boolean>(false);
  const [bookSummary, setBookSummary] = useState<string | undefined>(undefined);

  const MAX_RESULTS = "5";
  const PRINT_TYPE = "books";
  const LANGUAGE = "en";
  const bookQuery = "a book about dragons and dragon riders";

  function handleSelectedBook(theBook: Book) {
    setSelectedBook(theBook);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setNextBookOpen(false);
  }

  async function handleNextBook() {
    setLoading(true);
    setNextBookOpen(true);
    const res = await fetch("http://localhost:3000/findNewBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.error("Failed to search for next book");
      return;
    }
    const data = await res.json();
    console.log("Next book data:", data);
    setBookSummary(data.summary);
    setBookTitles(data.books);
    setLoading(false);
  }

  async function handleReview(review: string, rate: number) {
    const res = await fetch("http://localhost:3000/addReview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book: selectedBook,
        review: review,
        rating: rate,
      }),
    });
    if (!res.ok) {
      console.error("Failed to submit review");
      return;
    }
    setSelectedBook(null);
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
    setLoading(true);
    setDialogOpen(true);
    const res = await fetch("http://localhost:3000/compareBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book: theBook,
      }),
    });
    const data = await res.json();
    console.log("Comparison result:", data);
    setComparedBook({ ...data, newBook: theBook } as ComparedBooks);
    setLoading(false);
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

      <CompareBook
        isOpen={dialogOpen}
        handleClose={handleCloseDialog}
        isLoading={loading}
        books={comparedBook}
      />

      <FindBook
        isOpen={nextBookOpen}
        handleClose={handleCloseDialog}
        summary={bookSummary}
        isLoading={loading}
      />

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
