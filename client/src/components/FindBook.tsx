import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkeletonCard } from "./SkeletonCard";
import type { Book } from "@/types/types";
import MiniBookCard from "./MiniBookCard";
import { useEffect, useState } from "react";

interface CompareBookProps {
  isOpen: boolean;
  summary: string | undefined;
  isLoading?: boolean;
  handleClose: () => void;
  books: Book[];
}

const loadingMessages = [
  "Hittar böcker",
  "Hittar böcker.",
  "Hittar böcker..",
  "Hittar böcker...",
];

export default function FindBook({
  books,
  isOpen,
  handleClose,
  summary,
  isLoading,
}: CompareBookProps) {
  const [loadingTitle, setLoadingTitle] = useState(loadingMessages[0]);

  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingTitle(loadingMessages[index]);
    }, 900);

    return () => clearInterval(interval); // Cleanup when loading stops
  }, [isLoading]);

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      {isLoading ? (
        <DialogContent aria-describedby="" className="w-[300px]">
          <DialogTitle>{loadingTitle}</DialogTitle>
          <SkeletonCard />
        </DialogContent>
      ) : (
        <DialogContent className="w-[600px]">
          <DialogHeader>
            <DialogTitle>Nästa bok förslag:</DialogTitle>
            <DialogDescription>
              Hittade {books.length} antal böcker som matchar din profil.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row gap-4 justify-between">
            {books.map((book, index) => (
              <MiniBookCard
                title={book.title}
                image={book.image.thumbnail}
                authors={book.authors}
                key={index}
              />
            ))}
          </div>
          <div className="mt-4 w-[550px]">
            <p>{summary || "Inget förslag tillgängligt"}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Stäng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
