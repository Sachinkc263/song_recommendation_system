import { getMoodColor, getMoodIcon } from "../../utils/mood";

export default function MoodBadge({ mood, size = "sm" }) {
  const color = getMoodColor(mood);
  const icon  = getMoodIcon(mood);

  const sizeClass =
    size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-0.5" :
    size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" :
                   "text-[13px] px-3 py-1 gap-1.5";

  return (
    <span
      className={"inline-flex items-center rounded-full font-medium border " + sizeClass}
      style={{
        color,
        borderColor: color + "35",
        backgroundColor: color + "12",
      }}
    >
      <span>{icon}</span>
      <span>{mood}</span>
    </span>
  );
}
