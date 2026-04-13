import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertDriveUrlToEmbed(url: string, type: "image" | "video" = "image"): string {
  if (!url) return url;
  
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return url;

  const fileId = match[1];
  
  if (type === "image") {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } else {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
