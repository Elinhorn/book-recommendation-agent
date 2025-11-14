import { createContext, useContext, useEffect, useState } from "react";
import type { Book } from "@/types/types";

interface SavedBooksContextType {
  savedBooks: Set<string>;
  readBooks: Set<string>;
  isLoading: boolean;
  toggleSaved: (book: Book) => Promise<void>;
}

const SavedBooksContext = createContext<SavedBooksContextType | null>(null);

export function SavedBooksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [readBooks, setReadBooks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedBooks() {
      try {
        const res = await fetch("http://localhost:3000/notReadBooks");
        if (!res.ok) throw new Error("Failed to fetch saved books");
        const data: Book[] = await res.json();
        setSavedBooks(new Set(data.map((b) => b.infoLink)));
      } catch (err) {
        console.error("Error fetching saved books:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedBooks();
    loadReadBooks();
  }, []);

  async function loadReadBooks() {
    try {
      const res = await fetch("http://localhost:3000/myBooks");
      if (!res.ok) throw new Error("Failed to fetch saved read books");
      const data: Book[] = await res.json();
      setReadBooks(new Set(data.map((b) => b.infoLink)));
    } catch (err) {
      console.error("Error fetching saved books:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleSaved(book: Book) {
    const bookId = book.infoLink;
    const currentlySaved = savedBooks.has(bookId);

    try {
      const res = await fetch("http://localhost:3000/notReadBooksToggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book,
          action: currentlySaved ? "unsave" : "save",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle saved book");

      setSavedBooks((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.delete(bookId);
        else next.add(bookId);
        return next;
      });
    } catch (err) {
      console.error("Error toggling saved book:", err);
    }
  }

  return (
    <SavedBooksContext.Provider
      value={{ savedBooks, readBooks, isLoading, toggleSaved }}
    >
      {children}
    </SavedBooksContext.Provider>
  );
}

export function useSavedBooks() {
  const ctx = useContext(SavedBooksContext);
  if (!ctx)
    throw new Error("useSavedBooks must be used inside SavedBooksProvider");
  return ctx;
}
