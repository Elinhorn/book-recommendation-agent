export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export function getTopSimilarBooks(newEmbedding, books, topN = 3) {
  const scored = books.map(book => ({
    ...book,
    similarity: cosineSimilarity(newEmbedding, book.description_embedding)
  }));

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topN);
}