import { useState, useEffect } from "react";
import { useGetHomepageSettings, useUpdateHomepageSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function AdminBerandaSettings() {
  const { data: settings, isLoading } = useGetHomepageSettings();
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
    features: [] as { title: string; description: string }[],
    statsItems: [] as { value: string; label: string }[],
  });

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
        features: settings.features || [],
        statsItems: settings.statsItems || [],
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    const newStats = [...formData.statsItems];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, statsItems: newStats });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { title: "", description: "" }] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const addStat = () => {
    setFormData({ ...formData, statsItems: [...formData.statsItems, { value: "", label: "" }] });
  };

  const removeStat = (index: number) => {
    const newStats = [...formData.statsItems];
    newStats.splice(index, 1);
    setFormData({ ...formData, statsItems: newStats });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/settings/homepage"] });
          toast({
            title: "Tersimpan",
            description: "Pengaturan beranda berhasil disimpan.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Gagal",
            description: "Terjadi kesalahan saat menyimpan pengaturan.",
          });
        }
      }
    );
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold">Pengaturan Beranda</h1>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Bagian Hero (Atas)</CardTitle>
          </CardHeader>
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
              <Label htmlFor="heroImageUrl">URL Gambar Background (Google Drive URL / Langsung)</Label>
              <Input id="heroImageUrl" name="heroImageUrl" value={formData.heroImageUrl} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bagian Tentang Kami</CardTitle>
          </CardHeader>
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
              <Label htmlFor="aboutImageUrl">URL Gambar Tentang Kami</Label>
              <Input id="aboutImageUrl" name="aboutImageUrl" value={formData.aboutImageUrl} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.statsItems.map((stat, idx) => (
              <div key={idx} className="flex gap-4 items-end border p-4 rounded-md">
                <div className="space-y-2 flex-1">
                  <Label>Nilai (Misal: 150+)</Label>
                  <Input value={stat.value} onChange={(e) => handleStatChange(idx, "value", e.target.value)} />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Label (Misal: Kepala Keluarga)</Label>
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
              <div key={idx} className="space-y-4 border p-4 rounded-md relative">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2" 
                  onClick={() => removeFeature(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="space-y-2 pt-2">
                  <Label>Judul Fasilitas</Label>
                  <Input value={feature.title} onChange={(e) => handleFeatureChange(idx, "title", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi Singkat</Label>
                  <Textarea value={feature.description} onChange={(e) => handleFeatureChange(idx, "description", e.target.value)} />
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
