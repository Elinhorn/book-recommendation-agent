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
import type { ComparedBooks } from "@/types/types";
import { SkeletonCard } from "./SkeletonCard";
import MiniBookCard from "./MiniBookCard";
import { useEffect, useState } from "react";

interface CompareBookProps {
  isOpen: boolean;
  books: ComparedBooks | undefined;
  isLoading?: boolean;
  handleClose: () => void;
}
const loadingMessages = [
  "Laddar jämförelse",
  "Laddar jämförelse.",
  "Laddar jämförelse..",
  "Laddar jämförelse...",
  "Analyserar böcker",
  "Analyserar böcker.",
  "Analyserar böcker..",
  "Analyserar böcker...",
];

export default function CompareBook({
  isOpen,
  handleClose,
  books,
  isLoading,
}: CompareBookProps) {
  const [loadingTitle, setLoadingTitle] = useState(loadingMessages[0]);

  function describeSimilarity(score: number) {
    if (score >= 0.75) {
      return "Mycket stark matchning";
    } else if (score >= 0.65) {
      return "Tydliga likheter";
    } else if (score >= 0.5) {
      return "Viss koppling";
    } else {
      return "Inte alls lika";
    }
  }

  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingTitle(loadingMessages[index]);
    }, 900);

    return () => clearInterval(interval); // Cleanup when loading stops
  }, [isLoading]);

  const similarityScore = describeSimilarity(books?.match.similarity || 0);
  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      {isLoading ? (
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>{loadingTitle}</DialogTitle>
          <SkeletonCard />
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {books?.match?.similarity != null
                ? `Jämför böcker: ${Math.round(books.match.similarity * 100)}%`
                : "Fel vid hämtning"}
            </DialogTitle>
            <DialogDescription>{similarityScore}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4">
            <MiniBookCard
              image={
                books?.match.image || "https://placehold.co/66x99?text=No+Cover"
              }
              title={books?.match.title || "Fel bok 1"}
              authors={books?.match.authors || ["Fel bok 1"]}
            />
            <MiniBookCard
              image={
                books?.newBook.image.thumbnail ||
                "https://placehold.co/66x99?text=No+Cover"
              }
              title={books?.newBook.title || "Fel bok 2"}
              authors={books?.newBook.authors || ["Fel bok 2"]}
            />
          </div>
          <div className="grid gap-4">
            <p>{books?.answer}</p>
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
