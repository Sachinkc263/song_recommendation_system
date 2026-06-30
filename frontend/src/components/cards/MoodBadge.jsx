import { getMoodColor, getMoodIcon } from "../../utils/mood";

export default function MoodBadge({ mood, size = "sm" }) {
  const color = getMoodColor(mood);
  const icon = getMoodIcon(mood);
  return (
    <span
      className={"inline-flex items-center gap-1 rounded-full font-medium border " +
        (size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1")}
      style={{ color, borderColor: color + "40", backgroundColor: color + "15" }}
    >
      <span>{icon}</span>
      <span>{mood}</span>
    </span>
  );
}
