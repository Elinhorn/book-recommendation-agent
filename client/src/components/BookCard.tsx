import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Book } from "@/types/types";
import { BookOpenText } from "lucide-react";

interface BookCardProps {
  book: Book;
  onSelectClick?: () => void;
  onCompareClick?: () => void;
}

export function BookCard({
  book,
  onSelectClick,
  onCompareClick,
}: BookCardProps) {
  return (
    <Card className="flex-col justify-between py-0">
      <div className="aspect-[2/3] relative">
        <img
          src={
            book.image?.thumbnail ||
            "https://placehold.co/200x300?text=No+Cover"
          }
          alt={`Cover of ${book.title}`}
          className="object-cover w-full h-full rounded-t"
        />
      </div>

      <CardContent className="py-0 px-4">
        <h3 className="font-medium text-base line-clamp-1">{book.title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-1">
          {book.authors.join(", ")}
        </p>

        <div className="flex items-center mt-2">
          <BookOpenText className="h-4 w-4 mr-1" />
          <span className="text-sm text-gray-600">{book.pageCount} pages</span>

          {book.categories?.[0] && (
            <Badge variant="outline" className="text-xs ml-auto">
              {book.categories[0]}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col p-4 pt-0">
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={onSelectClick}
        >
          Recensera
        </Button>
        {onCompareClick && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={onCompareClick}
          >
            Passar denna mig?
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
