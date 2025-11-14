import { useSavedBooks } from "@/context/BooksContext";
import { Heart, BookOpenText } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/types/types";

interface BookCardProps {
  book: Book;
  onSelectClick?: () => void;
  onCompareClick?: () => void;
  onSimilarClick?: () => void;
}

export function BookCard({
  book,
  onSelectClick,
  onCompareClick,
  onSimilarClick,
}: BookCardProps) {
  const { savedBooks, toggleSaved, readBooks } = useSavedBooks();
  const isSaved = savedBooks.has(book.infoLink);
  const isReviewed = readBooks.has(book.infoLink);

  return (
    <Card className="flex-col justify-between py-0 relative">
      <div className="aspect-[2/3] relative">
        <img
          src={
            book.image?.thumbnail ||
            "https://placehold.co/200x300?text=No+Cover"
          }
          alt={`Cover of ${book.title}`}
          className="object-cover w-full h-full rounded-t"
        />
        <button
          onClick={() => toggleSaved(book)}
          className="absolute top-2 right-2 bg-white/70 rounded-full p-2 shadow hover:bg-white transition"
        >
          {isSaved ? (
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          ) : (
            <Heart className="h-5 w-5 text-gray-500 hover:text-red-500" />
          )}
        </button>
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
        {onSelectClick && (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={onSelectClick}
            disabled={isReviewed && !book.review}
          >
            {isReviewed ? "Ändra recension" : "Recensera"}
          </Button>
        )}

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

        {onSimilarClick && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={onSimilarClick}
          >
            Hitta liknande
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
