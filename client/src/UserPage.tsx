import { useEffect, useState } from "react";
import { BookCard } from "./components/BookCard";
import { BookReviewCard } from "./components/BookCardReview";
import type { Book } from "./types/types";
import { Button } from "./components/ui/button";
import { Sparkles } from "lucide-react";
import UserBookProfile from "./components/UserBookProfile";

export default function UserPage() {
  const [bookTitles, setBookTitles] = useState<Book[]>([]);
  const [bookCount, setBookCount] = useState<number | undefined>(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [userProfileOpen, setUserProfileOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function updateReview(review: string, rate: number) {
    if (!selectedBook?.id) {
      setError("Ingen bok vald för uppdatering");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/updateReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedBook?.id,
          review: review,
          rating: rate,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update review: ${res.status}`);
      }
      setSelectedBook(null);
      setError(null);
    } catch (error) {
      console.error("Failed to update review:", error);
      setError("Kunde inte uppdatera recensionen. Försök igen.");
    }
  }

  async function handleUserProfile() {
    try {
      setLoading(true);
      setUserProfileOpen(true);
      setError(null);

      const res = await fetch("http://localhost:3000/getUserProfile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }

      const data = await res.json();

      setTitle(data.title);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setError("Kunde inte hämta läsprofilen. Försök igen.");
      setUserProfileOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectedBook(theBook: Book) {
    setSelectedBook(theBook);
  }

  function cancelReview() {
    setSelectedBook(null);
  }

  function handleCloseDialog() {
    setUserProfileOpen(false);
  }

  useEffect(() => {
    async function fetchBooks() {
      try {
        setError(null);
        const res = await fetch("http://localhost:3000/myBooks");

        if (!res.ok) {
          throw new Error(`Failed to fetch books: ${res.status}`);
        }

        const data = await res.json();

        setBookTitles(data);
        setBookCount(data.length || 0);
      } catch (error) {
        console.error("Failed to fetch books:", error);
        setError("Kunde inte hämta dina böcker. Uppdatera sidan.");
        setBookTitles([]);
        setBookCount(0);
      }
    }
    fetchBooks();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Mina böcker:</h1>
        <Button onClick={handleUserProfile}>
          <Sparkles />
          Visa min läsprofil!
        </Button>
      </div>

      {selectedBook && (
        <BookReviewCard
          book={selectedBook}
          onSubmitReview={updateReview}
          onCancel={cancelReview}
        />
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

      <UserBookProfile
        isOpen={userProfileOpen}
        handleClose={handleCloseDialog}
        title={title}
        summary={summary}
        isLoading={loading}
        books={bookCount}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bookTitles.map((book: Book, index: number) => (
          <BookCard
            book={book}
            onSelectClick={() => {
              handleSelectedBook(book);
            }}
            key={index}
          />
        ))}
      </div>
    </>
  );
}
