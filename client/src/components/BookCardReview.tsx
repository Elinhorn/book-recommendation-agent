import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Book } from "@/types/types";
import { BookOpenText } from "lucide-react";
import { useState } from "react";

interface BookReviewCardProps {
  book: Book;
  onSubmitReview?: (review: string) => void;
}

export function BookReviewCard({ book, onSubmitReview }: BookReviewCardProps) {
  const [review, setReview] = useState("");

  function handleSubmit() {
    if (onSubmitReview) {
      onSubmitReview(review);
      setReview("");
    }
  }

  return (
    <Card className="flex flex-col md:flex-row p-4 gap-6">
      <div className="w-full md:max-w-[200px]">
        <div className="aspect-[2/3] relative mb-4">
          <img
            src={
              book.image?.thumbnail ||
              "https://via.placeholder.com/200x300?text=No+Cover"
            }
            alt={`Cover of ${book.title}`}
            className="object-cover w-full h-full rounded"
          />
        </div>

        <CardContent className="p-0">
          <h3 className="font-semibold text-base line-clamp-2">{book.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.authors.join(", ")}
          </p>

          <div className="flex items-center mt-2">
            <BookOpenText className="h-4 w-4 mr-1" />
            <span className="text-sm text-gray-600">
              {book.pageCount} pages
            </span>

            {book.categories?.[0] && (
              <Badge variant="outline" className="text-xs ml-auto">
                {book.categories[0]}
              </Badge>
            )}
          </div>
        </CardContent>
      </div>

      <div className="flex-1 flex flex-col">
        <Textarea
          placeholder="Write your review here..."
          className="flex-1 min-h-[150px]"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <CardFooter className="p-0 pt-4">
          <Button onClick={handleSubmit} className="ml-auto">
            Submit Review
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
