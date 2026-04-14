import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface DriveUploadProps {
  onUpload: (url: string, fileId: string) => void;
  accept?: string;
  label?: string;
  appsScriptUrl: string;
  folderId?: string;
}

export function DriveUpload({ onUpload, accept = "image/*", label = "Upload ke Google Drive", appsScriptUrl, folderId }: DriveUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!appsScriptUrl) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Atur URL Apps Script di menu Pengaturan Drive terlebih dahulu.
      </p>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const payload = {
        file: base64,
        mimeType: file.type,
        fileName: file.name,
        folderId: folderId || "",
      };

      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onUpload(data.url, data.fileId);
        toast({ title: "Berhasil", description: `${file.name} berhasil diunggah ke Google Drive.` });
      } else {
        throw new Error(data.error || "Upload gagal");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal Upload",
        description: err.message || "Terjadi kesalahan saat mengunggah file.",
      });
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => fileRef.current?.click()}
      >
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" /> {label}</>
        )}
      </Button>
    </div>
  );
}
