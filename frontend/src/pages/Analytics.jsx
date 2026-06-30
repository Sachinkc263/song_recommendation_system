import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getAnalytics } from "../api/songs";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import { getMoodColor } from "../utils/mood";

const TOOLTIP_STYLE = { background: "#282828", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 12 };

const PIE_COLORS = ["#1DB954","#FF5722","#42A5F5","#FFD700","#AB47BC",
                    "#EC407A","#FFA726","#26C6DA","#66BB6A","#7E57C2",
                    "#26A69A","#FF6D00","#5C6BC0","#FF4081","#EF5350"];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#181818] rounded-xl p-5">
      <p className="text-xs text-[#B3B3B3] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-[#B3B3B3] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <div className="p-6"><LoadingSpinner text="Loading analytics…" /></div>;
  if (isError || !data) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  const radarData = Object.entries(data.avg_features || {}).map(([k, v]) => ({
    feature: k.charAt(0).toUpperCase() + k.slice(1),
    value: Math.round(v * 100),
  }));

  const moodPieData = (data.mood_distribution || []).slice(0, 10).map((m) => ({
    name: m.mood,
    value: m.count,
    color: getMoodColor(m.mood),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tracks" value={data.total_tracks?.toLocaleString()} />
        <StatCard label="Year Range" value={data.year_range?.[0]} sub={"to " + data.year_range?.[1]} />
        <StatCard label="Genres" value={(data.genre_distribution || []).length} sub="unique genres" />
        <StatCard label="Top Artist" value={(data.top_artists || [])[0]?.name || "—"} sub={(data.top_artists || [])[0]?.count + " tracks"} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre distribution */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Top Genres</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(data.genre_distribution || []).slice(0, 12)} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#B3B3B3", fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" fill="#1DB954" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mood distribution */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Mood Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={moodPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#444" }}
              >
                {moodPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Decade distribution */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Songs by Decade</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.decade_distribution || []}>
              <XAxis dataKey="decade" tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" fill="#42A5F5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audio features radar */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Avg. Audio Profile</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="feature" tick={{ fill: "#B3B3B3", fontSize: 11 }} />
              <Radar name="Average" dataKey="value" stroke="#1DB954" fill="#1DB954" fillOpacity={0.25} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Popularity distribution */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Popularity Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.popularity_distribution || []}>
              <XAxis dataKey="range" tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top artists */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Top Artists by Track Count</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(data.top_artists || []).slice(0, 8)} layout="vertical">
              <XAxis type="number" tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#B3B3B3", fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" fill="#EC407A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
