import { useEffect, useState } from "react";
import { BookCard } from "./components/BookCard";
import type { Book } from "./types/types";

export default function NotReadPage() {
  const [bookTitles, setBookTitles] = useState<Book[]>([]);
  const [bookCount, setBookCount] = useState<number | undefined>(0);

  useEffect(() => {
    async function fetchNotReadBooks() {
      try {
        const res = await fetch("http://localhost:3000/notReadBooks");
        if (!res.ok) throw new Error("Failed to fetch not read books");
        const data: Book[] = await res.json();
        setBookTitles(data);
        setBookCount(data.length);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotReadBooks();
  }, []);

  return (
    <>
      <div className="flex justify-start items-center">
        <h1 className="text-2xl font-semibold">
          Böcker att läsa: {bookCount || 0}{" "}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bookTitles.map((book: Book, index: number) => (
          <BookCard book={book} key={index} />
        ))}
      </div>
    </>
  );
}
