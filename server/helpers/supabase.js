import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON
);


export async function storeBookReview({ book, review, rating, review_embedding, description_embedding  }) {
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