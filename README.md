# book-recommendation-agent

## AI-Powered Book Recommendation System

This project implements an AI-driven web application for personalized book recommendations and semantic book search. The application leverages embeddings to understand book descriptions and reviews, and an AI agent to generate relevant book suggestions based on a user's reading history.

### features

- **Add and Update Reviews:** Users can submit new book reviews with ratings, which are then processed using AI embeddings.
- **Semantic Book Search:** Find books within your review history that are semantically similar to a given book description.
- **AI-Generated Book Comparisons:** Get detailed comparisons between a new book and a similar one you've reviewed, focusing on genre, theme, and tone.
- **Personalized Book Recommendations:** An AI agent analyzes your past reviews and recommends new books sourced from the Google Books API.

### Tech used

- **Backend:** Node.js, Express.js
- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/ui
- **Database:** Supabase (PostgreSQL with pgvector for embeddings)
- **AI/ML:**
  - OpenAI API (Embeddings: text-embedding-ada-002)
  - OpenAI API (LLMs: gpt-4 for comparisons, o4-mini for agents)
  - OpenAI Agents Library (@openai/agents)
- **External APIs:** Google Books API

### Installation and Setup

Follow these steps to set up and run the application locally.

#### Prerequisites

- Node.js (v18+)
- npm (Node Package Manager)
- Supabase account and a new project
- OpenAI API Key
- Google Books API Key (optional, but recommended for the agent)
