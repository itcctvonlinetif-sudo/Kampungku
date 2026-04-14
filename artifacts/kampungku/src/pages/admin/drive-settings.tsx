import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDriveSettings, useUpdateDriveSettings, useTestDriveConnection } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, HardDrive, Info, ChevronDown, ChevronUp, Code2 } from "lucide-react";

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    if (e.postData && e.postData.contents) {
      var params = JSON.parse(e.postData.contents);
      if (params.ping) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, ping: true })).setMimeType(ContentService.MimeType.JSON);
      }
      var fileData = Utilities.base64Decode(params.file);
      var blob = Utilities.newBlob(fileData, params.mimeType, params.fileName);
      var folder;
      if (params.folderId) {
        try { folder = DriveApp.getFolderById(params.folderId); } catch(err) { folder = DriveApp.getRootFolder(); }
      } else {
        folder = DriveApp.getRootFolder();
      }
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        fileId: file.getId(),
        url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'No data' })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function AdminDriveSettings() {
  const { data: settings, isLoading } = useGetDriveSettings();
  const updateMutation = useUpdateDriveSettings();
  const testMutation = useTestDriveConnection();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCode, setShowCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const [formData, setFormData] = useState({ appsScriptUrl: "", folderId: "" });

  useEffect(() => {
    if (settings) {
      setFormData({ appsScriptUrl: settings.appsScriptUrl || "", folderId: settings.folderId || "" });
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
        toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan saat menguji koneksi." });
      }
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (isLoading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <HardDrive className="w-6 h-6" /> Pengaturan Integrasi Google Drive
        </h1>
        <p className="text-muted-foreground">Konfigurasi endpoint Apps Script untuk fitur upload foto, video, dan dokumen langsung ke Google Drive.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-800">
              <Info className="w-5 h-5" /> Panduan Setup Google Apps Script
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-3">
            <p className="font-semibold">Cara setup (tanpa Google Cloud Console):</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Buka <strong>Google Drive</strong> lalu klik tombol <strong>+ Baru</strong> → <strong>Lainnya</strong> → <strong>Google Apps Script</strong></li>
              <li>Hapus semua kode yang ada, lalu tempel kode script di bawah ini</li>
              <li>Klik <strong>Deploy</strong> → <strong>New deployment</strong> → pilih <strong>"Web app"</strong></li>
              <li>Set <strong>"Execute as": Me</strong> | <strong>"Who has access": Anyone</strong></li>
              <li>Klik <strong>Deploy</strong> → izinkan akses → salin <strong>Web app URL</strong></li>
              <li>Tempel URL tersebut di kolom di bawah, lalu simpan</li>
            </ol>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                {showCode ? "Sembunyikan" : "Tampilkan"} Kode Google Apps Script
                {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCode && (
                <div className="mt-3 relative">
                  <pre className="bg-gray-900 text-green-300 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {APPS_SCRIPT_CODE}
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyCode}
                  >
                    {codeCopied ? "Tersalin!" : "Salin Kode"}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-3 p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800">
              <strong>Catatan:</strong> Untuk mengambil Folder ID, buka folder tujuan di Google Drive, lalu salin ID yang ada di URL setelah <code>/folders/</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Konfigurasi Apps Script</CardTitle>
              <CardDescription>Masukkan URL deployment dan Folder ID tujuan upload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Apps Script URL (Web App URL)</Label>
                <Input
                  value={formData.appsScriptUrl}
                  onChange={e => setFormData({ ...formData, appsScriptUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
              </div>
              <div className="space-y-2">
                <Label>Google Drive Folder ID (Opsional)</Label>
                <Input
                  value={formData.folderId}
                  onChange={e => setFormData({ ...formData, folderId: e.target.value })}
                  placeholder="1A2B3C4D5E6F7G8H9I0J..."
                />
                <p className="text-xs text-muted-foreground">Jika kosong, file akan tersimpan di root Google Drive Anda.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
              <Button type="button" variant="outline" onClick={handleTest} disabled={testMutation.isPending || !formData.appsScriptUrl}>
                {testMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menguji...</> : "Test Koneksi"}
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
