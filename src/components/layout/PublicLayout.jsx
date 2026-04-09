import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-red-950 text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
