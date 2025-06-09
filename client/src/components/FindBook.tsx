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

interface CompareBookProps {
  isOpen: boolean;
  summary: string | undefined;
  isLoading?: boolean;
  handleClose: () => void;
}

export default function FindBook({
  isOpen,
  handleClose,
  summary,
  isLoading,
}: CompareBookProps) {
  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      {isLoading ? (
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Jobbar...</DialogTitle>
          <SkeletonCard />
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nästa bok förslag:</DialogTitle>
            <DialogDescription>
              Hittade X antal böcker som matchar din förfrågan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
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
