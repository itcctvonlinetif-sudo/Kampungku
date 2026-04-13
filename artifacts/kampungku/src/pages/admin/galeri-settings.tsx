import { AdminLayout } from "@/components/layout/admin-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListGalleryImages, useListGalleryVideos, useCreateGalleryImage, useCreateGalleryVideo, useDeleteGalleryImage, useDeleteGalleryVideo } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, Link as LinkIcon, HardDrive } from "lucide-react";
import { convertDriveUrlToEmbed } from "@/lib/utils";

export default function AdminGaleriSettings() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Manajemen Galeri</h1>
        <p className="text-muted-foreground">Kelola foto dan video yang ditampilkan di halaman galeri publik.</p>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="images">Foto</TabsTrigger>
          <TabsTrigger value="videos">Video</TabsTrigger>
        </TabsList>
        <TabsContent value="images">
          <ImagesTab />
        </TabsContent>
        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function ImagesTab() {
  const { data: images, isLoading } = useListGalleryImages();
  const createMutation = useCreateGalleryImage();
  const deleteMutation = useDeleteGalleryImage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({ title: "", url: "", description: "" });
  const [uploadMode, setUploadMode] = useState<"url" | "drive">("url");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast({ variant: "destructive", title: "Error", description: "Judul dan URL wajib diisi." });
      return;
    }

    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/gallery/images"] });
        setFormData({ title: "", url: "", description: "" });
        toast({ title: "Berhasil", description: "Foto berhasil ditambahkan." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/gallery/images"] });
          toast({ title: "Berhasil", description: "Foto dihapus." });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Tambah Foto Baru</h2>
          <div className="flex gap-2 mb-4">
            <Button type="button" variant={uploadMode === "url" ? "default" : "outline"} onClick={() => setUploadMode("url")} size="sm">
              <LinkIcon className="w-4 h-4 mr-2" /> URL Langsung
            </Button>
            <Button type="button" variant={uploadMode === "drive" ? "default" : "outline"} onClick={() => setUploadMode("drive")} size="sm">
              <HardDrive className="w-4 h-4 mr-2" /> Google Drive URL
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Foto</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{uploadMode === "drive" ? "URL Share Google Drive (Bisa Edit / View)" : "URL Gambar Langsung"}</Label>
              <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} required placeholder={uploadMode === "drive" ? "https://drive.google.com/file/d/.../view" : "https://example.com/image.jpg"} />
            </div>
            <div className="space-y-2">
              <Label>Keterangan (Opsional)</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Tambah Foto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Daftar Foto</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : images?.length === 0 ? (
          <p className="text-muted-foreground">Belum ada foto.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images?.map(img => (
              <Card key={img.id} className="overflow-hidden group">
                <div className="aspect-[4/3] relative bg-muted">
                  <img src={convertDriveUrlToEmbed(img.url, "image")} alt={img.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(img.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Hapus
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{img.title}</h3>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideosTab() {
  const { data: videos, isLoading } = useListGalleryVideos();
  const createMutation = useCreateGalleryVideo();
  const deleteMutation = useDeleteGalleryVideo();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({ title: "", url: "", description: "" });
  const [uploadMode, setUploadMode] = useState<"url" | "drive">("url");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast({ variant: "destructive", title: "Error", description: "Judul dan URL wajib diisi." });
      return;
    }

    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/gallery/videos"] });
        setFormData({ title: "", url: "", description: "" });
        toast({ title: "Berhasil", description: "Video berhasil ditambahkan." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus video ini?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/gallery/videos"] });
          toast({ title: "Berhasil", description: "Video dihapus." });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Tambah Video Baru</h2>
          <div className="flex gap-2 mb-4">
            <Button type="button" variant={uploadMode === "url" ? "default" : "outline"} onClick={() => setUploadMode("url")} size="sm">
              <LinkIcon className="w-4 h-4 mr-2" /> URL Langsung (YouTube/Embed)
            </Button>
            <Button type="button" variant={uploadMode === "drive" ? "default" : "outline"} onClick={() => setUploadMode("drive")} size="sm">
              <HardDrive className="w-4 h-4 mr-2" /> Google Drive URL
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Video</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{uploadMode === "drive" ? "URL Share Google Drive" : "URL Embed Video"}</Label>
              <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} required placeholder={uploadMode === "drive" ? "https://drive.google.com/file/d/.../view" : "https://www.youtube.com/embed/..."} />
            </div>
            <div className="space-y-2">
              <Label>Keterangan (Opsional)</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Tambah Video"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Daftar Video</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : videos?.length === 0 ? (
          <p className="text-muted-foreground">Belum ada video.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos?.map(vid => (
              <Card key={vid.id} className="overflow-hidden flex flex-col">
                <div className="aspect-video relative bg-muted">
                  <iframe src={convertDriveUrlToEmbed(vid.url, "video")} title={vid.title} className="w-full h-full" allowFullScreen></iframe>
                </div>
                <div className="p-3 flex justify-between items-center flex-1">
                  <h3 className="font-bold text-sm line-clamp-1 flex-1 pr-2">{vid.title}</h3>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(vid.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
