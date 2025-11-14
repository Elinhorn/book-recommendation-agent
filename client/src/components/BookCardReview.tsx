import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Book } from "@/types/types";
import { BookOpenText } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookReviewCardProps {
  book: Book;
  onSubmitReview: (review: string, rate: number) => void;
  onCancel: () => void;
}

export function BookReviewCard({
  book,
  onSubmitReview,
  onCancel,
}: BookReviewCardProps) {
  const [review, setReview] = useState(book.review ?? "");
  const [rate, setRate] = useState(book.rating?.toString() ?? "0");

  function handleSubmit() {
    if (review.trim() !== "") {
      onSubmitReview(review, Number(rate));
      setReview("");
      setRate("0");
    }
  }

  function handleCancel() {
    onCancel();
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
        <CardFooter className="p-0 pt-4 justify-between">
          <Select
            value={rate.toString()}
            onValueChange={(value) => setRate(value)}
            defaultValue={rate.toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Betyg" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0" disabled>
                Betyg
              </SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Button
              onClick={handleCancel}
              variant={"outline"}
              className="ml-auto mr-5"
            >
              Avbryt
            </Button>
            <Button onClick={handleSubmit} className="ml-auto">
              Skicka Recension
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
