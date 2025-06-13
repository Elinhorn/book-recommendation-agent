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

##### 1. Clone repo

##### 2. Create a .env file _(see example in repo)_

##### 3. Supabase Configuration

- Log in to your Supabase account.

- Create a new table named book_reviews.

- Configure the table schema with the following columns:

  | Column                | Type         | Description                              |
  | :-------------------- | :----------- | :--------------------------------------- |
  | id                    | uuid         | Primary key, default: uuid_generate_v4() |
  | title                 | text         | Book title                               |
  | authors               | jsonb        | Authors (array of strings)               |
  | categories            | jsonb        | Categories (array of strings)            |
  | page_count            | int4         | Number of pages                          |
  | description           | text         | Book description                         |
  | description_embedding | vector(1536) | Embedding of the book's description      |
  | image_small_thumbnail | text         | URL for small cover thumbnail            |
  | image_thumbnail       | text         | URL for large cover thumbnail            |
  | info_link             | text         | Link to book information                 |
  | rating                | int4         | User's rating (1-5)                      |
  | review                | text         | User's review text                       |
  | review_embedding      | vector(1536) | Embedding of the user's review           |
  | created_at            | timestamptz  | Default: now()                           |

- Enable the pgvector extension in your Supabase database.

```
create extension if not exists vector;

create table book_reviews (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  authors text[] not null,
  categories text[] not null,
  page_count integer,
  description text,
  description_embedding vector(1536),
  image_small_thumbnail text,
  image_thumbnail text,
  info_link text,
  rating integer,
  review text,
  review_embedding vector(1536), -- OpenAI embeddings
  created_at timestamp default now()
);
```

##### 4. Install Dependencies

Navigate to the project root and install the dependencies for both the backend and frontend.

```
npm i
```

##### 5. Run the Application

You are going to need 2 terminals for running this project, one for the frontend and the second for the backend.
To start the server and client you run:

```
npm run dev
```

#### Code Structure

- `server.js:` The main server file, defining API endpoints and orchestrating AI functionalities.
- `helpers/:` Directory containing helper modules for:
  - `generate-embeddings.js:` Handles text embedding generation.
  - `supabase.js:` Interacts with the Supabase database for CRUD operations.
  - `calculations.js:` Contains logic for cosine similarity and semantic search.
  - `llm.js:` Functions for LLM-based book comparisons.
  - `agent.js:` Defines the AI agent and its integrated tools.
- `client/:` The source code for the frontend application.
