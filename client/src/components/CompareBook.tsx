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

interface CompareBookProps {
  isOpen: boolean;
  books: ComparedBooks | undefined;
  isLoading?: boolean;
  handleClose: () => void;
}

export default function CompareBook({
  isOpen,
  handleClose,
  books,
  isLoading,
}: CompareBookProps) {
  function describeSimilarity(score: number) {
    if (score >= 0.89) {
      return "Väldigt liknande";
    } else if (score >= 0.83) {
      return "Något liknande";
    } else if (score >= 0.75) {
      return "Inte så liknande";
    } else {
      return "Inte alls lika";
    }
  }

  const similarityScore = describeSimilarity(books?.match.similarity || 0);
  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      {isLoading ? (
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Laddar jämförelse...</DialogTitle>
          <SkeletonCard />
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Jämför böcker: {similarityScore}</DialogTitle>
            <DialogDescription>
              {books?.match.title} och
              {books?.newBook.title}
            </DialogDescription>
          </DialogHeader>
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
