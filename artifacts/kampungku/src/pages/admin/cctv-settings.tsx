import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetCctvSettings, useUpdateCctvSettings, useListCctvCameras, useCreateCctvCamera, useDeleteCctvCamera } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, Plus } from "lucide-react";

export default function AdminCctvSettings() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Kamera CCTV</h1>
        <p className="text-muted-foreground">Kelola daftar kamera CCTV dan pengaturan halaman akses warga.</p>
      </div>

      <Tabs defaultValue="cameras" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="cameras">Daftar Kamera</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan Akses</TabsTrigger>
        </TabsList>
        <TabsContent value="cameras">
          <CamerasTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function CamerasTab() {
  const { data: cameras, isLoading } = useListCctvCameras();
  const createMutation = useCreateCctvCamera();
  const deleteMutation = useDeleteCctvCamera();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    streamUrl: "",
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cctv/cameras"] });
        setFormData({ name: "", location: "", streamUrl: "", isActive: true });
        toast({ title: "Berhasil", description: "Kamera CCTV ditambahkan." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus kamera ini?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/cctv/cameras"] });
          toast({ title: "Berhasil", description: "Kamera dihapus." });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Kamera Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Kamera</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="CCTV Pos Utama" />
              </div>
              <div className="space-y-2">
                <Label>Lokasi (Opsional)</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Gerbang Depan" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL Stream (Embed/Iframe src)</Label>
              <Input value={formData.streamUrl} onChange={e => setFormData({...formData, streamUrl: e.target.value})} required placeholder="https://..." />
            </div>
            <div className="flex items-center space-x-2 py-2">
              <Switch 
                id="active" 
                checked={formData.isActive} 
                onCheckedChange={c => setFormData({...formData, isActive: c})} 
              />
              <Label htmlFor="active">Kamera Aktif</Label>
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Tambah Kamera"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Kamera Tersedia</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !cameras || cameras.length === 0 ? (
          <p className="text-muted-foreground">Belum ada kamera CCTV yang diatur.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map(cam => (
              <Card key={cam.id} className={!cam.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {cam.name} {!cam.isActive && <span className="text-xs bg-muted px-2 py-0.5 rounded">Nonaktif</span>}
                    </CardTitle>
                    <CardDescription>{cam.location}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cam.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-xs">
                      Preview Stream tidak dimuat di halaman admin
                    </div>
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
  const { data: settings, isLoading } = useGetCctvSettings();
  const updateMutation = useUpdateCctvSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    pageTitle: "",
    pageDescription: "",
    pagePassword: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        pageTitle: settings.pageTitle || "",
        pageDescription: settings.pageDescription || "",
        pagePassword: settings.pagePassword || ""
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings/cctv"] });
        toast({ title: "Tersimpan", description: "Pengaturan CCTV diperbarui." });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Halaman & Password</CardTitle>
        <CardDescription>Atur judul dan password yang dibutuhkan warga untuk mengakses halaman CCTV.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Halaman</Label>
            <Input value={formData.pageTitle} onChange={e => setFormData({...formData, pageTitle: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi Halaman</Label>
            <Textarea value={formData.pageDescription} onChange={e => setFormData({...formData, pageDescription: e.target.value})} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Password Warga (Untuk mengakses CCTV)</Label>
            <Input type="text" value={formData.pagePassword} onChange={e => setFormData({...formData, pagePassword: e.target.value})} />
            <p className="text-xs text-muted-foreground">Berikan password ini kepada warga agar mereka bisa mengakses halaman CCTV.</p>
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="mt-4">
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
