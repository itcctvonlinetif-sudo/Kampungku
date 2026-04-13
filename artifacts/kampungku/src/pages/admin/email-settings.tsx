import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetEmailSettings, useUpdateEmailSettings, useTestEmailConnection } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Info } from "lucide-react";

export default function AdminEmailSettings() {
  const { data: settings, isLoading } = useGetEmailSettings();
  const updateMutation = useUpdateEmailSettings();
  const testMutation = useTestEmailConnection();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    gmailUser: "",
    gmailAppPassword: "",
    recipientEmail: "",
    senderName: "Admin Kampungku"
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        gmailUser: settings.gmailUser || "",
        gmailAppPassword: settings.gmailAppPassword || "",
        recipientEmail: settings.recipientEmail || "",
        senderName: settings.senderName || "Admin Kampungku"
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings/email"] });
        toast({ title: "Tersimpan", description: "Pengaturan Email berhasil diperbarui." });
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
        toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan saat menguji koneksi email." });
      }
    });
  };

  if (isLoading) return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <Mail className="w-6 h-6" /> Pengaturan Notifikasi Email
        </h1>
        <p className="text-muted-foreground">Konfigurasi email untuk menerima pemberitahuan pesan dari formulir kontak.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-bold">Cara Mendapatkan Gmail App Password:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Pastikan akun Google Anda sudah mengaktifkan <strong>2-Step Verification (Verifikasi 2 Langkah)</strong>.</li>
              <li>Buka <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-medium hover:text-blue-600">Pengaturan Keamanan Akun Google</a>.</li>
              <li>Cari bagian "How you sign in to Google" dan pilih <strong>2-Step Verification</strong>.</li>
              <li>Scroll ke paling bawah dan klik <strong>App passwords</strong>.</li>
              <li>Buat app password baru dengan nama "Kampungku Web", lalu copy 16 digit kode yang muncul dan paste ke form di bawah.</li>
            </ol>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Kredensial Gmail</CardTitle>
              <CardDescription>Masukkan kredensial pengirim dan penerima email notifikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Pengirim (Gmail)</Label>
                  <Input type="email" value={formData.gmailUser} onChange={e => setFormData({...formData, gmailUser: e.target.value})} placeholder="admin@gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>Gmail App Password (16 digit)</Label>
                  <Input type="password" value={formData.gmailAppPassword} onChange={e => setFormData({...formData, gmailAppPassword: e.target.value})} placeholder="abcd efgh ijkl mnop" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Nama Pengirim</Label>
                  <Input value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} placeholder="Admin Kampungku" />
                </div>
                <div className="space-y-2">
                  <Label>Email Penerima Notifikasi</Label>
                  <Input type="email" value={formData.recipientEmail} onChange={e => setFormData({...formData, recipientEmail: e.target.value})} placeholder="pengurus@gmail.com" />
                  <p className="text-xs text-muted-foreground">Pesan masuk akan diteruskan ke email ini.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
              <Button type="button" variant="outline" onClick={handleTest} disabled={testMutation.isPending || !formData.gmailUser || !formData.gmailAppPassword}>
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
