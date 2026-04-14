import { useState, useEffect } from "react";
import { useGetHomepageSettings, useUpdateHomepageSettings, useGetDriveSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, HardDrive, Link as LinkIcon } from "lucide-react";
import { DriveUpload } from "@/components/drive-upload";
import { convertDriveUrlToEmbed } from "@/lib/utils";

type Feature = {
  icon?: string;
  title: string;
  description: string;
  imageUrl?: string;
};

type StatItem = {
  value: string;
  label: string;
};

export default function AdminBerandaSettings() {
  const { data: settings, isLoading } = useGetHomepageSettings();
  const { data: driveSettings } = useGetDriveSettings();
  const updateMutation = useUpdateHomepageSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    aboutTitle: "",
    aboutText: "",
    aboutImageUrl: "",
    featuresTitle: "",
    features: [] as Feature[],
    statsItems: [] as StatItem[],
  });

  const [heroUploadMode, setHeroUploadMode] = useState<"url" | "drive">("url");
  const [aboutUploadMode, setAboutUploadMode] = useState<"url" | "drive">("url");

  useEffect(() => {
    if (settings) {
      setFormData({
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        heroImageUrl: settings.heroImageUrl || "",
        aboutTitle: settings.aboutTitle || "",
        aboutText: settings.aboutText || "",
        aboutImageUrl: settings.aboutImageUrl || "",
        featuresTitle: settings.featuresTitle || "",
        features: (settings.features as Feature[]) || [],
        statsItems: (settings.statsItems as StatItem[]) || [],
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const updated = [...formData.features];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, features: updated });
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    const updated = [...formData.statsItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, statsItems: updated });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { title: "", description: "", imageUrl: "", icon: "" }] });
  };

  const removeFeature = (index: number) => {
    const updated = [...formData.features];
    updated.splice(index, 1);
    setFormData({ ...formData, features: updated });
  };

  const addStat = () => {
    setFormData({ ...formData, statsItems: [...formData.statsItems, { value: "", label: "" }] });
  };

  const removeStat = (index: number) => {
    const updated = [...formData.statsItems];
    updated.splice(index, 1);
    setFormData({ ...formData, statsItems: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/settings/homepage"] });
          toast({ title: "Tersimpan", description: "Pengaturan beranda berhasil disimpan." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan." });
        }
      }
    );
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  const appsScriptUrl = driveSettings?.appsScriptUrl || "";
  const folderId = driveSettings?.folderId || "";

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold">Pengaturan Beranda</h1>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Bagian Hero (Banner Utama)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Judul Utama</Label>
              <Input id="heroTitle" name="heroTitle" value={formData.heroTitle} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Sub Judul</Label>
              <Input id="heroSubtitle" name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Gambar Background Hero</Label>
              <div className="flex gap-2 mb-2">
                <Button type="button" size="sm" variant={heroUploadMode === "url" ? "default" : "outline"} onClick={() => setHeroUploadMode("url")}>
                  <LinkIcon className="w-3 h-3 mr-1" /> URL
                </Button>
                <Button type="button" size="sm" variant={heroUploadMode === "drive" ? "default" : "outline"} onClick={() => setHeroUploadMode("drive")}>
                  <HardDrive className="w-3 h-3 mr-1" /> Google Drive
                </Button>
              </div>
              {heroUploadMode === "url" ? (
                <Input name="heroImageUrl" value={formData.heroImageUrl} onChange={handleChange} placeholder="https://..." />
              ) : (
                <div className="space-y-2">
                  <DriveUpload
                    appsScriptUrl={appsScriptUrl}
                    folderId={folderId}
                    accept="image/*"
                    label="Upload Gambar Background"
                    onUpload={(url) => setFormData({ ...formData, heroImageUrl: url })}
                  />
                  {formData.heroImageUrl && (
                    <div className="mt-2">
                      <img src={convertDriveUrlToEmbed(formData.heroImageUrl, "image")} className="h-24 rounded-md object-cover" alt="preview" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bagian Tentang Kami</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aboutTitle">Judul Tentang Kami</Label>
              <Input id="aboutTitle" name="aboutTitle" value={formData.aboutTitle} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutText">Teks Tentang Kami</Label>
              <Textarea id="aboutText" name="aboutText" rows={5} value={formData.aboutText} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Gambar Tentang Kami</Label>
              <div className="flex gap-2 mb-2">
                <Button type="button" size="sm" variant={aboutUploadMode === "url" ? "default" : "outline"} onClick={() => setAboutUploadMode("url")}>
                  <LinkIcon className="w-3 h-3 mr-1" /> URL
                </Button>
                <Button type="button" size="sm" variant={aboutUploadMode === "drive" ? "default" : "outline"} onClick={() => setAboutUploadMode("drive")}>
                  <HardDrive className="w-3 h-3 mr-1" /> Google Drive
                </Button>
              </div>
              {aboutUploadMode === "url" ? (
                <Input name="aboutImageUrl" value={formData.aboutImageUrl} onChange={handleChange} placeholder="https://..." />
              ) : (
                <DriveUpload
                  appsScriptUrl={appsScriptUrl}
                  folderId={folderId}
                  accept="image/*"
                  label="Upload Gambar"
                  onUpload={(url) => setFormData({ ...formData, aboutImageUrl: url })}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Statistik Perumahan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {formData.statsItems.map((stat, idx) => (
              <div key={idx} className="flex gap-4 items-end border p-4 rounded-md">
                <div className="space-y-1 flex-1">
                  <Label>Nilai (Contoh: 500+)</Label>
                  <Input value={stat.value} onChange={(e) => handleStatChange(idx, "value", e.target.value)} />
                </div>
                <div className="space-y-1 flex-1">
                  <Label>Label (Contoh: Unit Rumah)</Label>
                  <Input value={stat.label} onChange={(e) => handleStatChange(idx, "label", e.target.value)} />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeStat(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addStat} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Tambah Statistik
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fasilitas & Keunggulan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 mb-6">
              <Label htmlFor="featuresTitle">Judul Bagian Fasilitas</Label>
              <Input id="featuresTitle" name="featuresTitle" value={formData.featuresTitle} onChange={handleChange} />
            </div>

            {formData.features.map((feature, idx) => (
              <div key={idx} className="space-y-4 border p-4 rounded-lg relative bg-muted/20">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3"
                  onClick={() => removeFeature(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="space-y-1 pt-2">
                  <Label>Judul Fasilitas</Label>
                  <Input value={feature.title} onChange={(e) => handleFeatureChange(idx, "title", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Nama Ikon (Lucide Icon, Contoh: Shield, Trees, Wifi)</Label>
                  <Input value={feature.icon || ""} onChange={(e) => handleFeatureChange(idx, "icon", e.target.value)} placeholder="Shield" />
                </div>
                <div className="space-y-1">
                  <Label>Deskripsi Singkat</Label>
                  <Textarea value={feature.description} onChange={(e) => handleFeatureChange(idx, "description", e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Gambar Fasilitas (Opsional)</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Input
                      value={feature.imageUrl || ""}
                      onChange={(e) => handleFeatureChange(idx, "imageUrl", e.target.value)}
                      placeholder="URL Gambar atau Upload ke Drive"
                      className="flex-1 min-w-0"
                    />
                    <DriveUpload
                      appsScriptUrl={appsScriptUrl}
                      folderId={folderId}
                      accept="image/*"
                      label="Upload"
                      onUpload={(url) => handleFeatureChange(idx, "imageUrl", url)}
                    />
                  </div>
                  {feature.imageUrl && (
                    <img
                      src={convertDriveUrlToEmbed(feature.imageUrl, "image")}
                      className="h-20 rounded-md object-cover mt-2"
                      alt="preview fasilitas"
                    />
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeature} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Tambah Fasilitas
            </Button>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}
