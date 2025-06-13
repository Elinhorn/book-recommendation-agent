import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON
);

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
      authors,
      categories,
      page_count: pageCount,
      description,
      description_embedding,
      image_small_thumbnail: image.smallThumbnail,
      image_thumbnail: image.thumbnail,
      info_link: infoLink,
      rating,
      review,
      review_embedding,
    },
  ]);

  if (error) {
    throw new Error("Supabase insert failed: " + error.message);
  }
}

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
        : JSON.parse(b.description_embedding), // Safely convert string to array
    }));
}

export async function fetchAllBooksFromDatabase() {
  const { data, error } = await supabase
    /*     .from("book_reviews")
    .select("id, title, authors, description, page_count, categories, image_small_thumbnail, image_thumbnail, info_link, review, rating"); */
    .from("book_reviews")
    .select(
      "title, authors, description, categories, image_thumbnail, review, rating"
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
