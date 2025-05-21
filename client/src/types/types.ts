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
