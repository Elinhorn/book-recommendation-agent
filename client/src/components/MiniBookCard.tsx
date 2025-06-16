import { Card, CardContent } from "@/components/ui/card";

interface MiniBookCardProps {
  image: string;
  title: string;
  authors: string[];
}

export default function MiniBookCard({
  image,
  title,
  authors,
}: MiniBookCardProps) {
  return (
    <Card className="flex-col justify-between py-0 w-[150px]">
      <div className="aspect-[2/3] relative">
        <img
          src={image || "https://placehold.co/66x99?text=No+Cover"}
          alt={`Cover of ${title}`}
          className="object-cover w-full h-full rounded-t"
        />
      </div>

      <CardContent className="py-0 px-4 mb-4">
        <h3 className="font-medium text-base line-clamp-1">{title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-1">
          {authors.join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}
