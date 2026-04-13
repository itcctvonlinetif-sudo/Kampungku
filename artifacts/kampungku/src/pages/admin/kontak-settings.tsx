import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetContactSettings, useUpdateContactSettings, useListContactMessages, useDeleteContactMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminKontakSettings() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Kontak & Pesan Masuk</h1>
        <p className="text-muted-foreground">Kelola informasi kontak dan lihat pesan dari pengunjung.</p>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="messages">Pesan Masuk</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan Info Kontak</TabsTrigger>
        </TabsList>
        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function MessagesTab() {
  const { data: messages, isLoading } = useListContactMessages();
  const deleteMutation = useDeleteContactMessage();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Hapus pesan ini permanen?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
          toast({ title: "Berhasil", description: "Pesan dihapus." });
        }
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {!messages || messages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Belum ada pesan masuk.
          </CardContent>
        </Card>
      ) : (
        messages.map(msg => (
          <Card key={msg.id}>
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{msg.subject || "Tanpa Subjek"}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>{msg.name} ({msg.email})</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {msg.createdAt ? formatDate(msg.createdAt) : ""}</span>
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(msg.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {msg.phone && <p className="text-sm font-medium mb-2">Telepon: {msg.phone}</p>}
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm border">
                {msg.message}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function SettingsTab() {
  const { data: settings, isLoading } = useGetContactSettings();
  const updateMutation = useUpdateContactSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    email: "",
    mapEmbedUrl: "",
    officeHours: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        mapEmbedUrl: settings.mapEmbedUrl || "",
        officeHours: settings.officeHours || ""
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings/contact"] });
        toast({ title: "Tersimpan", description: "Pengaturan kontak berhasil diperbarui." });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Kontak Publik</CardTitle>
        <CardDescription>Informasi ini akan ditampilkan di halaman Kontak.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            <Textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nomor Telepon / WhatsApp</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Jam Operasional</Label>
            <Textarea value={formData.officeHours} onChange={e => setFormData({...formData, officeHours: e.target.value})} rows={3} placeholder="Senin - Jumat: 08:00 - 17:00..." />
          </div>
          <div className="space-y-2">
            <Label>URL Embed Google Maps</Label>
            <Input value={formData.mapEmbedUrl} onChange={e => setFormData({...formData, mapEmbedUrl: e.target.value})} placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-xs text-muted-foreground">Buka Google Maps, cari lokasi, klik Share, pilih Embed a map, lalu copy src URL-nya saja.</p>
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="mt-4">
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
