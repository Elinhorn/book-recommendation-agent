import { NavLink, Outlet } from "react-router";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Book Buddy</h1>
        <nav className="flex justify-between items-center gap-4">
          <NavLink to="/">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "outline"}>Start</Button>
            )}
          </NavLink>
          <NavLink to="mybooks">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "outline"}>
                Mina Böcker
              </Button>
            )}
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
