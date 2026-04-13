import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDocumentsPageSettings, useUpdateDocumentsPageSettings, useListDocuments, useCreateDocument, useDeleteDocument } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, FileText, Link as LinkIcon, HardDrive } from "lucide-react";
import { convertDriveUrlToEmbed, formatDate } from "@/lib/utils";

export default function AdminDokumenSettings() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Pusat Dokumen</h1>
        <p className="text-muted-foreground">Kelola file dan dokumen yang bisa diunduh oleh warga.</p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="documents">Daftar Dokumen</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan Halaman</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function DocumentsTab() {
  const { data: documents, isLoading } = useListDocuments();
  const createMutation = useCreateDocument();
  const deleteMutation = useDeleteDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    category: "",
    fileType: "pdf",
  });
  const [uploadMode, setUploadMode] = useState<"url" | "drive">("url");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.fileUrl) {
      toast({ variant: "destructive", title: "Error", description: "Judul dan URL wajib diisi." });
      return;
    }

    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        setFormData({ title: "", description: "", fileUrl: "", category: "", fileType: "pdf" });
        toast({ title: "Berhasil", description: "Dokumen ditambahkan." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus dokumen ini?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
          toast({ title: "Berhasil", description: "Dokumen dihapus." });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Dokumen Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button type="button" variant={uploadMode === "url" ? "default" : "outline"} onClick={() => setUploadMode("url")} size="sm">
              <LinkIcon className="w-4 h-4 mr-2" /> URL File Langsung
            </Button>
            <Button type="button" variant={uploadMode === "drive" ? "default" : "outline"} onClick={() => setUploadMode("drive")} size="sm">
              <HardDrive className="w-4 h-4 mr-2" /> Google Drive Share URL
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul Dokumen</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Tata Tertib Warga 2024" />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Peraturan / Keuangan / Formulir" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{uploadMode === "drive" ? "URL Share Google Drive (Harus 'Anyone with the link can view')" : "URL Download File Langsung"}</Label>
              <Input value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} required placeholder={uploadMode === "drive" ? "https://drive.google.com/file/d/..." : "https://..."} />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Tambah Dokumen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Daftar Dokumen</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !documents || documents.length === 0 ? (
          <p className="text-muted-foreground">Belum ada dokumen.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <Card key={doc.id}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold flex-1 pr-2 line-clamp-2">{doc.title}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 -mt-1 -mr-1" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {doc.category && <div className="text-xs bg-muted text-muted-foreground w-fit px-2 py-0.5 rounded mb-2">{doc.category}</div>}
                  <div className="text-xs text-muted-foreground mt-auto pt-2 flex items-center justify-between border-t mt-4">
                    <span>{doc.createdAt ? formatDate(doc.createdAt) : ""}</span>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> Link File
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab() {
  const { data: settings, isLoading } = useGetDocumentsPageSettings();
  const updateMutation = useUpdateDocumentsPageSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    pageTitle: "",
    pageDescription: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        pageTitle: settings.pageTitle || "",
        pageDescription: settings.pageDescription || ""
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings/documents"] });
        toast({ title: "Tersimpan", description: "Pengaturan halaman dokumen diperbarui." });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teks Halaman Dokumen Publik</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Halaman</Label>
            <Input value={formData.pageTitle} onChange={e => setFormData({...formData, pageTitle: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi Singkat</Label>
            <Textarea value={formData.pageDescription} onChange={e => setFormData({...formData, pageDescription: e.target.value})} rows={3} />
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="mt-4">
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
