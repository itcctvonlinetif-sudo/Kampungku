import { getVideoEmbedInfo } from "@/lib/utils";

interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export function VideoEmbed({ url, title, className = "w-full h-full" }: VideoEmbedProps) {
  if (!url) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center text-muted-foreground text-sm`}>
        Tidak ada video
      </div>
    );
  }

  const { type, embedUrl } = getVideoEmbedInfo(url);

  if (type === "direct") {
    return (
      <video
        className={className}
        controls
        preload="metadata"
        title={title}
      >
        <source src={embedUrl} />
        Browser Anda tidak mendukung pemutaran video.
      </video>
    );
  }

  return (
    <iframe
      src={embedUrl}
      title={title || "Video"}
      className={className}
      allowFullScreen
      allow="autoplay; encrypted-media; picture-in-picture"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
