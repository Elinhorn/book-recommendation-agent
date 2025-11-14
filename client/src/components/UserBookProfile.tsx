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
import { useEffect, useState } from "react";

interface UserProfileBookProps {
  isOpen: boolean;
  title: string | undefined;
  summary: string | undefined;
  isLoading?: boolean;
  handleClose: () => void;
  books: number | undefined;
}

const loadingMessages = [
  "Hittar böcker.",
  "Analyserar böcker...",
  "Läser innehållet..",
  "Skapar läsprofil...",
];

export default function UserBookProfile({
  books,
  isOpen,
  handleClose,
  title,
  summary,
  isLoading,
}: UserProfileBookProps) {
  const [loadingTitle, setLoadingTitle] = useState(loadingMessages[0]);

  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingTitle(loadingMessages[index]);
    }, 900);

    return () => clearInterval(interval);
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
            <DialogTitle>Läsprofil: </DialogTitle>
            <DialogDescription className="text-xl font-bold mb-2">
              {title || "some error"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 w-[550px]">
            <p>{summary || "Inget förslag tillgängligt"}</p>
          </div>
          <p>Based on your last {books || 0} read books.</p>
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
