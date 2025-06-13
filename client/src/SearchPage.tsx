import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import type { Book, ComparedBooks } from "./types/types";
import { BookCard } from "./components/BookCard";
import { BookReviewCard } from "./components/BookCardReview";
import CompareBook from "./components/CompareBook";
import FindBook from "./components/FindBook";
import { Sparkles } from "lucide-react";

export default function SearchPage() {
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
    setBookPredictions(data.books);
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

  function cancelReview() {
    setSelectedBook(null);
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
    <>
      <div className="flex w-full justify-between items-center space-x-2">
        <div className="flex items-center space-x-2">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // prevent the page from reloading
              searchBookOnline(); // call your search function
            }}
            className="flex items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Boktitle"
              value={bookSearch}
              onChange={(e) => {
                setBookSearch(e.target.value);
              }}
            />
            <Button type="submit">Sök</Button>
          </form>
        </div>

        <Button onClick={handleNextBook}>
          <Sparkles />
          Hitta min nästa bok!
        </Button>
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
        books={bookPredictions}
      />

      {selectedBook && (
        <BookReviewCard
          book={selectedBook}
          onSubmitReview={handleReview}
          onCancel={cancelReview}
        />
      )}

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
    </>
  );
}
