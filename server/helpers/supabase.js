import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON
);

// store new book review with embeddings in database
export async function storeBookReview({
  book,
  review,
  rating,
  review_embedding,
  description_embedding,
}) {
  const {
    title,
    authors,
    categories,
    pageCount,
    description,
    image,
    infoLink,
  } = book;

  const { error } = await supabase.from("book_reviews").insert([
    {
      title,
      authors: authors || [],
      categories: categories || [],
      page_count: pageCount || 0,
      description: description || "",
      description_embedding,
      image_small_thumbnail: image?.smallThumbnail || "",
      image_thumbnail: image?.thumbnail || "",
      info_link: infoLink || "",
      rating: rating ?? null,
      review: review || "",
      review_embedding,
    },
  ]);

  if (error) {
    throw new Error("Supabase insert failed: " + error.message);
  }
}

// fetch books with embeddings for similarity comparisons
export async function fetchAllBooksWithEmbeddings() {
  const { data, error } = await supabase
    .from("book_reviews")
    .select(
      "id, title, authors, image_thumbnail, description, description_embedding"
    );

  if (error) throw error;
  return data
    .filter((b) => b.description_embedding)
    .map((b) => ({
      ...b,
      image: b.image_thumbnail || "",
      authors: Array.isArray(b.authors)
        ? b.authors
        : JSON.parse(b.authors || "[]"),
      description_embedding: Array.isArray(b.description_embedding)
        ? b.description_embedding
        : JSON.parse(b.description_embedding),
    }));
}


// fetch all user reviewed books (full data for display)
export async function fetchAllBooksFromDatabase() {
  const { data, error } = await supabase
    .from("book_reviews")
    .select(
      "id, title, authors, description, categories, page_count, image_thumbnail, review, rating, info_link"
    );

  if (error) throw error;

  console.log("Fetched books from database:", data.length, "books found");

  return (
    data?.map((b) => ({
      id: b.id,
      title: b.title,
      authors: Array.isArray(b.authors)
        ? b.authors
        : JSON.parse(b.authors || "[]"),
      categories: Array.isArray(b.categories)
        ? b.categories
        : JSON.parse(b.categories || "[]"),
      description: b.description || "",
      pageCount: b.page_count || 0,
      image: {
        smallThumbnail: b.image_small_thumbnail || "",
        thumbnail: b.image_thumbnail || "",
      },
      infoLink: b.info_link || "",
      review: b.review || "",
      rating: b.rating ?? null,
    })) || []
  );
}

// fetch books from "want to read" list
export async function fetchAllNotReadBooksFromDatabase() {
  const { data, error } = await supabase
    .from("book_not_read")
    .select(
      "id, title, authors, description, categories, page_count, image_thumbnail, info_link, created_at"
    );

  if (error) throw error;

  console.log("Fetched books from database:", data.length, "books found");

  return (
    data?.map((b) => ({
      id: b.id,
      title: b.title,
      authors: Array.isArray(b.authors)
        ? b.authors
        : JSON.parse(b.authors || "[]"),
      categories: Array.isArray(b.categories)
        ? b.categories
        : JSON.parse(b.categories || "[]"),
      description: b.description || "",
      pageCount: b.page_count || 0,
      image: {
        smallThumbnail: b.image_small_thumbnail || "",
        thumbnail: b.image_thumbnail || "",
      },
      infoLink: b.info_link || "",
      review: b.review || "",
      rating: b.rating ?? null,
      createdAt: new Date(b.created_at) || undefined, 
    })) || []
  );
}

// fetch minimal book data for AI profile generation
export async function fetchUserBooksLight() {
  const { data, error } = await supabase
    .from("book_reviews")
    .select("id, title, authors, description, review, rating");

  if (error) throw error;

  return (
    data?.map((b) => ({
      id: b.id,
      title: b.title,
      authors: Array.isArray(b.authors)
        ? b.authors
        : JSON.parse(b.authors || "[]"),
      description: b.description || "",
      review: b.review || "",
      rating: b.rating ?? null,
    })) || []
  );
}

// save book to "want to read" list
export async function saveBookToNotRead(book) {
  const { error } = await supabase.from("book_not_read").insert({
    title: book.title,
    authors: book.authors,
    categories: book.categories,
    page_count: book.pageCount,
    description: book.description,
    image_thumbnail: book.image?.thumbnail,
    image_small_thumbnail: book.image?.smallThumbnail,
    info_link: book.infoLink,
    created_at: new Date().toISOString(),
  });

  if (error) throw new Error("Failed to save book: " + error.message);
}
// remove book from "want to read" list 
export async function unsaveBookFromNotRead(link) {
  const { error } = await supabase
    .from("book_not_read")
    .delete()
    .eq("info_link", link);

  if (error) throw new Error("Failed to unsave book: " + error.message);
}

// update existing book review with new rating and review text
export async function updateBookReview(
  id,
  { review, rating, review_embedding }
) {
  const { error } = await supabase
    .from("book_reviews")
    .update({
      review,
      rating,
      review_embedding,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Supabase update failed: " + error.message);
  }
}

