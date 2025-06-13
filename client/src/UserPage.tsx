import { useEffect, useState } from "react";
import { BookCard } from "./components/BookCard";
import { BookReviewCard } from "./components/BookCardReview";
import type { Book } from "./types/types";

export default function UserPage() {
  const [bookTitles, setBookTitles] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  async function updateReview(review: string, rate: number) {
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
      console.error("Failed to submit review");
      return;
    }
    setSelectedBook(null);
  }

  function handleSelectedBook(theBook: Book) {
    setSelectedBook(theBook);
  }

  function handleCompareBook(theBook: Book) {
    console.log("Compare book:", theBook);
  }

  function cancelReview() {
    setSelectedBook(null);
  }

  useEffect(() => {
    async function fetchBooks() {
      const res = await fetch("http://localhost:3000/myBooks");
      if (!res.ok) {
        console.error("Failed to fetch books");
        return;
      }
      const data = await res.json();
      setBookTitles(data);
    }
    fetchBooks();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold">Mina böcker:</h1>
      {selectedBook && (
        <BookReviewCard
          book={selectedBook}
          onSubmitReview={updateReview}
          onCancel={cancelReview}
        />
      )}
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
