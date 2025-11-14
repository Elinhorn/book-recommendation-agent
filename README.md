# AI-Powered Book Recommendation System

An AI-driven web application for personalized book recommendations using embeddings and intelligent agents to understand your reading preferences.

## 🚀 Features

- **Smart Recommendations** - AI agent analyzes your reading history for personalized suggestions
- **Semantic Search** - Find books similar in theme and tone, not just keywords
- **Book Comparisons** - Get detailed AI comparisons between books
- **Reading Profiles** - Auto-generated personality profiles based on your reviews
- **Review Management** - Add, update, and manage your book reviews
- **Save for Later** - Build your reading wishlist

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, Supabase, OpenAI API, LangChain  
**Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn/ui  
**AI:** OpenAI Agents, embeddings, GPT-4o-mini 
**External APIs:** Google Books API

## ⚡ Quick Start

```bash
# Clone and install
git clone <repository-url>
cd book-recommendation-agent

# Install dependencies for both client and server
cd client && npm install
cd ../server && npm install

# Setup environment (create .env in server directory)
cd server
cp .env.example .env
# Add your OpenAI API key and Supabase credentials

# Run development servers (requires 2 terminals)
# Terminal 1 - Backend:
cd server && npm run dev

# Terminal 2 - Frontend:
cd client && npm run dev
```

## 🗄️ Database Setup

1. Create a Supabase project
2. Enable pgvector extension
3. Run this SQL:

```sql
create extension if not exists vector;

create table book_reviews (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  authors text[] not null,
  categories text[] not null,
  page_count integer,
  description text,
  description_embedding vector(256),
  image_small_thumbnail text,
  image_thumbnail text,
  info_link text,
  rating integer,
  review text,
  review_embedding vector(256),
  created_at timestamp default now()
);

create table not_read_books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  authors text[] not null,
  categories text[] not null,
  page_count integer,
  description text,
  image_small_thumbnail text,
  image_thumbnail text,
  info_link text,
  created_at timestamp default now()
);
```

## 🔑 Environment Variables

```env
OPENAI_API_KEY=your_actual_key_here
SUPABASE_URL=your_actual_url_here
SUPABASE_ANON=your_actual_anon_key_here
```

## 📁 Project Structure

```
book-recommendation-agent/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── types/      # TypeScript types
│   │   ├── context/    # React contexts
│   │   ├── lib/        # Utility functions
│   │   ├── SearchPage.tsx    # Main search page
│   │   ├── UserPage.tsx      # User library page
│   │   ├── NotReadPage.tsx   # Reading wishlist page
│   │   └── App.tsx     # Main app component
│   └── package.json
├── server/           # Express backend
│   ├── helpers/      # AI logic & database
│   │   ├── agent.js         # OpenAI agent config
│   │   ├── langchain.js     # LangChain integration
│   │   ├── supabase.js      # Database operations
│   │   └── ...
│   ├── server.js     # Main server
│   └── package.json
└── README.md
```

## 🤖 How It Works

1. **Add Reviews** - Rate and review books you've read
2. **AI Analysis** - System generates embeddings and reading profiles
3. **Get Recommendations** - AI agent finds books matching your taste
4. **Compare Books** - Semantic analysis compares new books with your library

## ⚙️ Technical Highlights

- **OpenAI Agents** for multi-step reasoning and tool usage
- **Vector embeddings** for semantic book similarity matching
- **LangChain** for structured AI profile generation
- **Smart caching** for improved performance and reduced API calls
- **Full TypeScript** for type safety across the stack

---
