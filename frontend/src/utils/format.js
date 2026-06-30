export function formatArtists(artists) {
  if (!artists) return "";
  try {
    const cleaned = String(artists).replace(/'/g, '"');
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.join(", ") : String(artists);
  } catch {
    return String(artists).replace(/[\[\]'"]/g, "").replace(/,\s*/g, ", ").trim();
  }
}

export function formatDuration(duration_min) {
  if (!duration_min) return "";
  const mins = Math.floor(duration_min);
  const secs = Math.round((duration_min - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getArtGradient(name) {
  const hash = String(name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const gradients = [
    "from-purple-600 to-indigo-800",
    "from-emerald-600 to-teal-800",
    "from-red-600 to-orange-800",
    "from-blue-600 to-cyan-800",
    "from-pink-600 to-rose-800",
    "from-yellow-500 to-orange-700",
    "from-teal-600 to-green-800",
    "from-indigo-600 to-purple-800",
    "from-fuchsia-600 to-pink-800",
    "from-sky-600 to-blue-800",
  ];
  return gradients[hash % gradients.length];
}

export function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function popularityColor(pop) {
  if (pop >= 70) return "#1DB954";
  if (pop >= 40) return "#FFA726";
  return "#B3B3B3";
}
