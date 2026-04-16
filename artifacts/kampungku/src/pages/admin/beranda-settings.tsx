import { useState, useEffect } from "react";
import { useGetHomepageSettings, useUpdateHomepageSettings, useGetDriveSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, HardDrive, Link as LinkIcon, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
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

type HomepageSection = {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  imagePosition?: "left" | "right" | "center";
  bgStyle?: "default" | "muted" | "primary";
  position: "above" | "below";
  order: number;
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

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
    homepageSections: [] as HomepageSection[],
  });

  const [heroUploadMode, setHeroUploadMode] = useState<"url" | "drive">("url");
  const [aboutUploadMode, setAboutUploadMode] = useState<"url" | "drive">("url");
  const [sectionImageModes, setSectionImageModes] = useState<Record<string, "url" | "drive">>({});

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
        homepageSections: (settings.homepageSections as HomepageSection[]) || [],
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

  // --- Custom sections ---
  const sectionsByPosition = (pos: "above" | "below") =>
    [...formData.homepageSections]
      .filter((s) => s.position === pos)
      .sort((a, b) => a.order - b.order);

  const addSection = (position: "above" | "below") => {
    const existing = formData.homepageSections.filter((s) => s.position === position);
    const newSection: HomepageSection = {
      id: generateId(),
      title: "Section Baru",
      subtitle: "",
      content: "",
      imageUrl: "",
      imagePosition: "right",
      bgStyle: "default",
      position,
      order: existing.length,
    };
    setFormData({ ...formData, homepageSections: [...formData.homepageSections, newSection] });
  };

  const updateSection = (id: string, field: string, value: string) => {
    const updated = formData.homepageSections.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setFormData({ ...formData, homepageSections: updated });
  };

  const removeSection = (id: string) => {
    setFormData({
      ...formData,
      homepageSections: formData.homepageSections.filter((s) => s.id !== id),
    });
  };

  const moveSectionOrder = (id: string, direction: "up" | "down") => {
    const section = formData.homepageSections.find((s) => s.id === id)!;
    const pos = section.position;
    const group = [...formData.homepageSections.filter((s) => s.position === pos)].sort(
      (a, b) => a.order - b.order
    );
    const idx = group.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === group.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = group[idx].order;
    group[idx] = { ...group[idx], order: group[swapIdx].order };
    group[swapIdx] = { ...group[swapIdx], order: newOrder };

    const others = formData.homepageSections.filter((s) => s.position !== pos);
    setFormData({ ...formData, homepageSections: [...others, ...group] });
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

  const renderSectionEditor = (section: HomepageSection, groupSections: HomepageSection[], idx: number) => (
    <div key={section.id} className="space-y-4 border p-4 rounded-lg relative bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Section {idx + 1}</span>
          <Badge variant={section.bgStyle === "primary" ? "default" : "secondary"}>
            {section.bgStyle === "primary" ? "Primer" : section.bgStyle === "muted" ? "Abu-abu" : "Normal"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveSectionOrder(section.id, "up")}
            disabled={idx === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => moveSectionOrder(section.id, "down")}
            disabled={idx === groupSections.length - 1}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            onClick={() => removeSection(section.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Nama / Judul Section</Label>
          <Input
            value={section.title}
            onChange={(e) => updateSection(section.id, "title", e.target.value)}
            placeholder="Contoh: Lokasi Strategis"
          />
        </div>
        <div className="space-y-1">
          <Label>Sub Judul (Opsional)</Label>
          <Input
            value={section.subtitle || ""}
            onChange={(e) => updateSection(section.id, "subtitle", e.target.value)}
            placeholder="Kalimat pendukung judul"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Konten / Paragraf</Label>
        <Textarea
          value={section.content || ""}
          onChange={(e) => updateSection(section.id, "content", e.target.value)}
          rows={3}
          placeholder="Isi teks section ini..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Gaya Latar Belakang</Label>
          <Select
            value={section.bgStyle || "default"}
            onValueChange={(v) => updateSection(section.id, "bgStyle", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Normal (Putih)</SelectItem>
              <SelectItem value="muted">Abu-abu</SelectItem>
              <SelectItem value="primary">Warna Primer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Posisi Gambar</Label>
          <Select
            value={section.imagePosition || "right"}
            onValueChange={(v) => updateSection(section.id, "imagePosition", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Kiri</SelectItem>
              <SelectItem value="right">Kanan</SelectItem>
              <SelectItem value="center">Tengah (Full Width)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gambar Section (Opsional)</Label>
        <div className="flex gap-2 mb-2">
          <Button
            type="button" size="sm"
            variant={(sectionImageModes[section.id] ?? "url") === "url" ? "default" : "outline"}
            onClick={() => setSectionImageModes({ ...sectionImageModes, [section.id]: "url" })}
          >
            <LinkIcon className="w-3 h-3 mr-1" /> URL
          </Button>
          <Button
            type="button" size="sm"
            variant={(sectionImageModes[section.id] ?? "url") === "drive" ? "default" : "outline"}
            onClick={() => setSectionImageModes({ ...sectionImageModes, [section.id]: "drive" })}
          >
            <HardDrive className="w-3 h-3 mr-1" /> Google Drive
          </Button>
        </div>
        {(sectionImageModes[section.id] ?? "url") === "url" ? (
          <Input
            value={section.imageUrl || ""}
            onChange={(e) => updateSection(section.id, "imageUrl", e.target.value)}
            placeholder="https://..."
          />
        ) : (
          <DriveUpload
            appsScriptUrl={appsScriptUrl}
            folderId={folderId}
            accept="image/*"
            label="Upload Gambar"
            onUpload={(url) => updateSection(section.id, "imageUrl", url)}
          />
        )}
        {section.imageUrl && (
          <img
            src={convertDriveUrlToEmbed(section.imageUrl, "image")}
            className="h-24 rounded-md object-cover mt-2"
            alt="preview section"
          />
        )}
      </div>
    </div>
  );

  const aboveSections = sectionsByPosition("above");
  const belowSections = sectionsByPosition("below");

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold">Pengaturan Beranda</h1>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero */}
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

        {/* Statistik */}
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

        {/* Tentang Kami */}
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

        {/* Section Custom di atas Fasilitas */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-400">Di atas Fasilitas</Badge>
                  Section Kustom — Di Atas
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Section-section ini muncul sebelum bagian Fasilitas & Keunggulan
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => addSection("above")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aboveSections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Belum ada section. Klik "Tambah Section" untuk membuat section baru di atas Fasilitas.
              </div>
            ) : (
              aboveSections.map((section, idx) => renderSectionEditor(section, aboveSections, idx))
            )}
          </CardContent>
        </Card>

        {/* Fasilitas & Keunggulan */}
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

        {/* Section Custom di bawah Fasilitas */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-400">Di bawah Fasilitas</Badge>
                  Section Kustom — Di Bawah
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Section-section ini muncul setelah bagian Fasilitas & Keunggulan
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => addSection("below")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {belowSections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Belum ada section. Klik "Tambah Section" untuk membuat section baru di bawah Fasilitas.
              </div>
            ) : (
              belowSections.map((section, idx) => renderSectionEditor(section, belowSections, idx))
            )}
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}
