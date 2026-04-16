import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListCustomPages, useCreateCustomPage, useUpdateCustomPage, useDeleteCustomPage, type CustomPage, type WebsiteLink } from "@/hooks/use-custom-pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Globe, EyeOff, Eye, Image, Link2, Video, X } from "lucide-react";

type FormData = {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  showInNav: boolean;
  sortOrder: number;
  imageUrls: string[];
  websiteLinks: WebsiteLink[];
  videoUrls: string[];
};

const emptyForm: FormData = {
  title: "",
  slug: "",
  content: "",
  isPublished: true,
  showInNav: true,
  sortOrder: 0,
  imageUrls: [],
  websiteLinks: [],
  videoUrls: [],
};

function MediaSection({
  icon,
  title,
  description,
  onAdd,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="gap-1 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>
      <div className="px-4 py-4">
        {children}
      </div>
    </div>
  );
}

export default function AdminHalamanSettings() {
  const { data: pages, isLoading } = useListCustomPages();
  const createMutation = useCreateCustomPage();
  const updateMutation = useUpdateCustomPage();
  const deleteMutation = useDeleteCustomPage();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");
    setFormData({ ...formData, title: value, slug: editingId ? formData.slug : slug });
  };

  const handleEdit = (page: CustomPage) => {
    setEditingId(page.id);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || "",
      isPublished: page.isPublished ?? true,
      showInNav: page.showInNav ?? true,
      sortOrder: page.sortOrder ?? 0,
      imageUrls: page.imageUrls ?? [],
      websiteLinks: page.websiteLinks ?? [],
      videoUrls: page.videoUrls ?? [],
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast({ variant: "destructive", title: "Error", description: "Judul dan slug wajib diisi." });
      return;
    }

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Berhasil", description: "Halaman berhasil diperbarui." });
            handleCancel();
          },
          onError: (err: Error) => {
            toast({ variant: "destructive", title: "Gagal", description: err.message });
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast({ title: "Berhasil", description: "Halaman baru berhasil dibuat." });
          handleCancel();
        },
        onError: (err: Error) => {
          toast({ variant: "destructive", title: "Gagal", description: err.message });
        },
      });
    }
  };

  const handleDelete = (page: CustomPage) => {
    if (!confirm(`Hapus halaman "${page.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    deleteMutation.mutate(page.id, {
      onSuccess: () => toast({ title: "Berhasil", description: "Halaman dihapus." }),
      onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus halaman." }),
    });
  };

  const addImageUrl = () => setFormData({ ...formData, imageUrls: [...formData.imageUrls, ""] });
  const updateImageUrl = (idx: number, val: string) => {
    const arr = [...formData.imageUrls];
    arr[idx] = val;
    setFormData({ ...formData, imageUrls: arr });
  };
  const removeImageUrl = (idx: number) => setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== idx) });

  const addWebsiteLink = () => setFormData({ ...formData, websiteLinks: [...formData.websiteLinks, { label: "", url: "" }] });
  const updateWebsiteLink = (idx: number, field: keyof WebsiteLink, val: string) => {
    const arr = [...formData.websiteLinks];
    arr[idx] = { ...arr[idx], [field]: val };
    setFormData({ ...formData, websiteLinks: arr });
  };
  const removeWebsiteLink = (idx: number) => setFormData({ ...formData, websiteLinks: formData.websiteLinks.filter((_, i) => i !== idx) });

  const addVideoUrl = () => setFormData({ ...formData, videoUrls: [...formData.videoUrls, ""] });
  const updateVideoUrl = (idx: number, val: string) => {
    const arr = [...formData.videoUrls];
    arr[idx] = val;
    setFormData({ ...formData, videoUrls: arr });
  };
  const removeVideoUrl = (idx: number) => setFormData({ ...formData, videoUrls: formData.videoUrls.filter((_, i) => i !== idx) });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Manajemen Halaman</h1>
          <p className="text-muted-foreground text-sm">Buat dan kelola halaman kustom yang dapat diakses publik.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Halaman
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8 border-primary/30">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Halaman" : "Tambah Halaman Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Judul Halaman</Label>
                  <Input
                    value={formData.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Peraturan Warga"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug URL (otomatis)</Label>
                  <Input
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="peraturan-warga"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Halaman akan dapat diakses di: <code>/halaman/{formData.slug || "..."}</code></p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Isi Halaman (HTML atau teks biasa)</Label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  placeholder="Tulis isi halaman di sini... Anda bisa menggunakan HTML."
                />
              </div>

              <MediaSection
                icon={<Image className="w-4 h-4 text-muted-foreground" />}
                title="URL Gambar"
                description="Tambahkan URL gambar"
                onAdd={addImageUrl}
              >
                {formData.imageUrls.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Tambahkan URL gambar yang akan ditampilkan di halaman ini — klik "Tambah" untuk menambahkan
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.imageUrls.map((url, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={url}
                          onChange={e => updateImageUrl(idx, e.target.value)}
                          placeholder="https://example.com/gambar.jpg"
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(idx)} className="shrink-0 text-destructive hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </MediaSection>

              <MediaSection
                icon={<Link2 className="w-4 h-4 text-muted-foreground" />}
                title="Link Website / Referensi"
                description="Tambahkan tautan"
                onAdd={addWebsiteLink}
              >
                {formData.websiteLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Tambahkan tautan website atau referensi eksternal — klik "Tambah" untuk menambahkan
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.websiteLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={link.label}
                          onChange={e => updateWebsiteLink(idx, "label", e.target.value)}
                          placeholder="Nama / Label"
                          className="w-36 shrink-0"
                        />
                        <Input
                          value={link.url}
                          onChange={e => updateWebsiteLink(idx, "url", e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeWebsiteLink(idx)} className="shrink-0 text-destructive hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </MediaSection>

              <MediaSection
                icon={<Video className="w-4 h-4 text-muted-foreground" />}
                title="URL Video / YouTube"
                description="Tambahkan link video"
                onAdd={addVideoUrl}
              >
                {formData.videoUrls.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Tambahkan link video YouTube atau upload file video — klik "Tambah" untuk menambahkan
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.videoUrls.map((url, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={url}
                          onChange={e => updateVideoUrl(idx, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeVideoUrl(idx)} className="shrink-0 text-destructive hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </MediaSection>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Urutan Tampil</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={v => setFormData({ ...formData, isPublished: v })}
                  />
                  <Label>Terbitkan Halaman</Label>
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Switch
                    checked={formData.showInNav}
                    onCheckedChange={v => setFormData({ ...formData, showInNav: v })}
                  />
                  <Label>Tampilkan di Menu</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : editingId ? "Simpan Perubahan" : "Buat Halaman"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !pages || pages.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
            <Globe className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-semibold text-foreground">Belum ada halaman kustom</p>
            <p className="text-sm text-muted-foreground mt-1">Klik "Tambah Halaman" untuk membuat halaman baru.</p>
          </div>
        ) : (
          pages.map(page => (
            <Card key={page.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {page.isPublished ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{page.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /halaman/{page.slug}
                    {page.showInNav && <span className="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">Tampil di Menu</span>}
                    {!page.isPublished && <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">Draft</span>}
                    {(page.imageUrls?.length > 0) && <span className="ml-2 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded text-xs">{page.imageUrls.length} Gambar</span>}
                    {(page.videoUrls?.length > 0) && <span className="ml-2 bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 px-1.5 py-0.5 rounded text-xs">{page.videoUrls.length} Video</span>}
                    {(page.websiteLinks?.length > 0) && <span className="ml-2 bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 px-1.5 py-0.5 rounded text-xs">{page.websiteLinks.length} Link</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(page)} disabled={deleteMutation.isPending}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
