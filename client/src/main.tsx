import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import SearchPage from "./SearchPage.tsx";
import UserPage from "./UserPage.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<SearchPage />} />
        <Route path="mybooks" element={<UserPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
