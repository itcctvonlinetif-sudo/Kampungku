import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function convertDriveUrlToEmbed(url: string, type: "image" | "video" = "image"): string {
  if (!url) return url;
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  if (type === "image") {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  } else {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

export function isDriveUrl(url: string): boolean {
  return url.includes("drive.google.com");
}

export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId: string | null = null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const p of patterns) {
    const m = url.match(p);
    if (m) {
      videoId = m[1];
      break;
    }
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}

export type VideoEmbedType = "youtube" | "drive" | "direct";

export function getVideoEmbedInfo(url: string): { type: VideoEmbedType; embedUrl: string } {
  if (!url) return { type: "direct", embedUrl: url };

  if (isYouTubeUrl(url)) {
    const embedUrl = getYouTubeEmbedUrl(url);
    return { type: "youtube", embedUrl: embedUrl || url };
  }

  if (isDriveUrl(url)) {
    const fileId = extractDriveFileId(url);
    if (fileId) {
      return { type: "drive", embedUrl: `https://drive.google.com/file/d/${fileId}/preview` };
    }
  }

  return { type: "direct", embedUrl: url };
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
