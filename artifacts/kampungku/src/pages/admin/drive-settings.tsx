import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDriveSettings, useUpdateDriveSettings, useTestDriveConnection } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, HardDrive, Info } from "lucide-react";

export default function AdminDriveSettings() {
  const { data: settings, isLoading } = useGetDriveSettings();
  const updateMutation = useUpdateDriveSettings();
  const testMutation = useTestDriveConnection();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    appsScriptUrl: "",
    folderId: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        appsScriptUrl: settings.appsScriptUrl || "",
        folderId: settings.folderId || ""
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings/drive"] });
        toast({ title: "Tersimpan", description: "Pengaturan Google Drive berhasil diperbarui." });
      }
    });
  };

  const handleTest = () => {
    testMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          toast({ title: "Berhasil", description: res.message });
        } else {
          toast({ variant: "destructive", title: "Gagal", description: res.message });
        }
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan saat menguji koneksi Drive." });
      }
    });
  };

  if (isLoading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <HardDrive className="w-6 h-6" /> Pengaturan Integrasi Google Drive
        </h1>
        <p className="text-muted-foreground">Konfigurasi endpoint Apps Script untuk fitur upload foto, video, dan dokumen langsung ke Drive.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-primary/10 border border-primary/20 text-primary-foreground p-4 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
          <div className="text-sm space-y-2 text-foreground">
            <p><strong>Fungsi Integrasi:</strong></p>
            <p>Pengaturan ini opsional. Jika diatur, admin dapat mengunggah file langsung dari website ke Google Drive tanpa harus membuka Google Drive secara manual.</p>
            <p>Anda perlu membuat Google Apps Script (berupa Web App) yang berfungsi sebagai jembatan untuk menerima file dan menyimpannya ke Folder ID yang ditentukan.</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Google Apps Script Web App</CardTitle>
              <CardDescription>Masukkan URL deployment dari Google Apps Script.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Apps Script URL (Web App URL)</Label>
                <Input value={formData.appsScriptUrl} onChange={e => setFormData({...formData, appsScriptUrl: e.target.value})} placeholder="https://script.google.com/macros/s/.../exec" />
              </div>
              <div className="space-y-2">
                <Label>Google Drive Folder ID</Label>
                <Input value={formData.folderId} onChange={e => setFormData({...formData, folderId: e.target.value})} placeholder="1A2B3C4D..." />
                <p className="text-xs text-muted-foreground">ID folder bisa didapatkan dari URL saat membuka folder di Google Drive (huruf & angka acak setelah /folders/)</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
              <Button type="button" variant="outline" onClick={handleTest} disabled={testMutation.isPending || !formData.appsScriptUrl}>
                {testMutation.isPending ? "Menguji..." : "Test Koneksi"}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
