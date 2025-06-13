export type Book = {
  id?: string;
  title: string;
  authors: string[];
  categories: string[];
  pageCount: number;
  description: string;
  image: {
    smallThumbnail: string;
    thumbnail: string;
  };
  infoLink: string;
  review?: string;
  rating?: number;
};

export type ComparedBooks = {
  answer: string;
  match: {
    description: string;
    description_embedding: number[];
    id: string;
    image: string;
    authors: string[];
    similarity?: number;
    title: string;
  };
  newBook: Book;
};
