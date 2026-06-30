export const MOODS = {
  Happy:      { icon: "😊", color: "#FFD700",  bg: "from-yellow-600 to-yellow-800",  desc: "Upbeat & joyful" },
  Sad:        { icon: "🌧️",  color: "#5C6BC0",  bg: "from-indigo-700 to-indigo-900",  desc: "Melancholic & emotional" },
  Party:      { icon: "🎉", color: "#FF4081",  bg: "from-pink-600 to-rose-800",      desc: "High-energy dance" },
  Workout:    { icon: "💪", color: "#FF5722",  bg: "from-orange-600 to-red-800",     desc: "Pump up your exercise" },
  Chill:      { icon: "🌊", color: "#26C6DA",  bg: "from-cyan-600 to-cyan-900",      desc: "Laid-back vibes" },
  Relax:      { icon: "🛋️",  color: "#66BB6A",  bg: "from-green-600 to-green-900",    desc: "Wind down & unwind" },
  Sleep:      { icon: "🌙", color: "#7E57C2",  bg: "from-purple-700 to-purple-900",  desc: "Soft music for sleep" },
  Focus:      { icon: "🎯", color: "#42A5F5",  bg: "from-blue-600 to-blue-900",      desc: "Deep work & flow" },
  Study:      { icon: "📚", color: "#AB47BC",  bg: "from-violet-600 to-violet-900",  desc: "Concentration boost" },
  Driving:    { icon: "🚗", color: "#FFA726",  bg: "from-amber-500 to-orange-800",   desc: "Music for the road" },
  Romantic:   { icon: "💕", color: "#EC407A",  bg: "from-rose-600 to-pink-900",      desc: "Love & romance" },
  Meditation: { icon: "🧘", color: "#26A69A",  bg: "from-teal-600 to-teal-900",      desc: "Calm & meditative" },
  "Feel Good":{ icon: "✨", color: "#1DB954",  bg: "from-green-600 to-emerald-900",  desc: "Songs that lift you up" },
  Energetic:  { icon: "⚡", color: "#FF6D00",  bg: "from-orange-500 to-red-700",     desc: "Maximum intensity" },
};

export const MOOD_ORDER = [
  "Happy", "Party", "Energetic", "Workout", "Driving",
  "Chill", "Relax", "Romantic", "Feel Good",
  "Focus", "Study", "Sad", "Sleep", "Meditation",
];

export function getMoodColor(mood) {
  return MOODS[mood]?.color || "#B3B3B3";
}

export function getMoodIcon(mood) {
  return MOODS[mood]?.icon || "🎵";
}

export function getMoodBg(mood) {
  return MOODS[mood]?.bg || "from-gray-600 to-gray-900";
}
