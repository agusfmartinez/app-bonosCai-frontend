import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";

export default function PrivateLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-red-950">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
