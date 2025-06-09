export type Book = {
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
};

export type ComparedBooks = {
  answer: string;
  match: {
    description: string;
    description_embedding: number[];
    id: string;
    similarity?: number;
    title: string;
  };
  newBook: Book;
};
