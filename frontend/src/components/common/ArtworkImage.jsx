import { useState } from "react";
import { BsMusicNote } from "react-icons/bs";
import { getArtGradient } from "../../utils/format";

/**
 * Shared album-art component used across the entire app.
 *
 * Props:
 *   coverUrl  — URL from `song.cover_url`  (null/undefined → gradient)
 *   name      — song name (used to derive the gradient colour)
 *   className — extra classes applied to the outer wrapper (required: position + size)
 *   iconSize  — tailwind text-* class for the fallback music-note icon
 */
export default function ArtworkImage({
  coverUrl,
  name = "",
  className = "",
  iconSize = "text-3xl",
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const gradient  = getArtGradient(name);
  const showImage = !!coverUrl && !errored;

  return (
    <div className={"relative overflow-hidden " + className}>
      {/* Gradient placeholder — always underneath; also shown while image loads */}
      <div
        className={
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br " +
          gradient +
          // Pulse skeleton effect while the real image is in-flight
          (showImage && !loaded ? " animate-pulse" : "")
        }
      >
        <BsMusicNote className={"text-white/30 " + iconSize} />
      </div>

      {/* Real cover image */}
      {showImage && (
        <img
          src={coverUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className={
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 " +
            (loaded ? "opacity-100" : "opacity-0")
          }
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
