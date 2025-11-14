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
  const [bookTitles, setBookTitles] = useState<Book[] | null>(null);
  const [comparedBook, setComparedBook] = useState<ComparedBooks | undefined>();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookPredictions, setBookPredictions] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [nextBookOpen, setNextBookOpen] = useState<boolean>(false);
  const [bookSummary, setBookSummary] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  function handleSelectedBook(theBook: Book) {
    setSelectedBook(theBook);
    setTimeout(() => {
      document
        .getElementById("selected-book-review")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setNextBookOpen(false);
  }

  async function handleNextBook() {
    setLoading(true);
    setError(null);
    setNextBookOpen(true);

    try {
      const res = await fetch("http://localhost:3000/findNewBook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.books || !Array.isArray(data.books)) {
        throw new Error("Invalid response format");
      }

      setBookSummary(data.summary);
      setBookTitles(data.books);
      setBookPredictions(data.books);
    } catch (error) {
      console.error("Failed to search for next book:", error);
      setError("AIn är nog lite trött då något blev fel, försök gärna senare.");
      setNextBookOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(review: string, rate: number) {
    if (!selectedBook) {
      setError("Ingen bok vald för recension");
      return;
    }
    try {
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
        throw new Error(`Failed to submit review: ${res.status}`);
      }
      setSelectedBook(null);
      setError(null);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setError("Kunde inte spara recensionen. Försök igen.");
      alert("Kunde inte spara recensionen. Försök igen.");
    }
  }

  function cancelReview() {
    setSelectedBook(null);
  }

  async function handleSimilarBook(theBook: Book) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/recommendSimilar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: theBook.title,
          authors: theBook.authors,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch similar books");
      }

      const data = await response.json();

      const books = (data.books || []).map((info: any) => {
        const book: Book = {
          title: info.title || "Untitled",
          authors: info.authors || ["Unknown"],
          categories: info.categories || ["Uncategorized"],
          pageCount: info.pageCount || 0,
          description: info.description || "No description available.",
          image: {
            smallThumbnail:
              info.image?.smallThumbnail ||
              "https://placehold.co/200x300?text=No+Cover",
            thumbnail:
              info.image?.thumbnail ||
              "https://placehold.co/200x300?text=No+Cover",
          },
          infoLink: info.infoLink || "#",
        };

        return book;
      });

      setBookTitles(books);
    } catch (error) {
      console.error("Error fetching similar books:", error);
      setError("Kunde inte hitta liknande böcker, försök igen senare.");
      setBookTitles([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchBookOnline() {
    if (!bookSearch.trim()) {
      setError("Skriv in en söksträng först");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          bookSearch
        )}&maxResults=10&printType=books&langRestrict=en`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        setBookTitles([]);
        setError("Inga böcker hittades för din sökning");
        return;
      }

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

      setBookTitles(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Kunde inte hitta boken du letade efter, försök igen senare.");
      setBookTitles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompareBook(theBook: Book) {
    try {
      setLoading(true);
      setDialogOpen(true);
      setError(null);

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
        throw new Error(`Compare book failed: ${res.status}`);
      }

      const data = await res.json();

      setComparedBook({ ...data, newBook: theBook } as ComparedBooks);
    } catch (error) {
      console.error("Error compare book:", error);
      setError("Kunde inte jämföra bok, försök igen senare.");
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upptäck din nästa favoritbok
        </h1>
        <p className="text-gray-600 mb-8">
          Sök efter böcker eller låt AI:n hitta din perfekta match
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchBookOnline();
            }}
            className="flex items-center gap-4"
          >
            <Input
              type="text"
              placeholder="Boktitel eller författare..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-80"
            />
            <Button type="submit">Sök</Button>
          </form>

          <Button
            onClick={handleNextBook}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Hitta min nästa bok!
          </Button>
        </div>
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
        <div className="mb-8" id="selected-book-review">
          <BookReviewCard
            book={selectedBook}
            onSubmitReview={handleReview}
            onCancel={cancelReview}
          />
        </div>
      )}

      {error !== null && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Fel:</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl font-bold ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-transparent" />
        </div>
      )}

      {bookTitles === null ? null : bookTitles.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
            Sökresultat ({bookTitles.length} böcker)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookTitles.map((book, index) => (
              <BookCard
                key={index}
                book={book}
                onSelectClick={() => handleSelectedBook(book)}
                onCompareClick={() => handleCompareBook(book)}
                onSimilarClick={() => handleSimilarBook(book)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg">Inga böcker hittades 🥲</p>
          <p className="text-sm text-gray-400">
            Försök med ett annat sökord eller kontrollera stavningen.
          </p>
        </div>
      )}
    </div>
  );
}
