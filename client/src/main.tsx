import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import SearchPage from "./SearchPage.tsx";
import UserPage from "./UserPage.tsx";
import NotReadPage from "./NotReadPage.tsx";

import { SavedBooksProvider } from "./context/BooksContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <SavedBooksProvider>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<SearchPage />} />
          <Route path="mybooks" element={<UserPage />} />
          <Route path="notreadbooks" element={<NotReadPage />} />
        </Route>
      </Routes>
    </SavedBooksProvider>
  </BrowserRouter>
);
