import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import SongDetail from "./pages/SongDetail";
import Recommendations from "./pages/Recommendations";
import MoodExplorer from "./pages/MoodExplorer";
import Analytics from "./pages/Analytics";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Settings from "./pages/Settings";
import GenreSongs from "./pages/GenreSongs";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/song/:name" element={<SongDetail />} />
        <Route path="/recommendations/:name" element={<Recommendations />} />
        <Route path="/mood" element={<MoodExplorer />} />
        <Route path="/mood/:mood" element={<MoodExplorer />} />
        <Route path="/genre/:genre" element={<GenreSongs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
