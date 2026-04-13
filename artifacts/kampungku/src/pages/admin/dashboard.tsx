import { useGetHomepageSettings, useGetContactSettings, useGetEmailSettings, useGetDriveSettings, useGetCctvSettings, useGetDocumentsPageSettings, useListContactMessages } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Image as ImageIcon, Video, Phone, Mail, HardDrive, FileText, Camera, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: messages } = useListContactMessages();
  const unreadMessagesCount = messages?.filter(m => !m.isRead).length || 0;

  const summaryCards = [
    { title: "Pengaturan Beranda", icon: Home, href: "/admin/beranda", description: "Kelola teks hero, fitur, dan info statistik." },
    { title: "Manajemen Galeri", icon: ImageIcon, href: "/admin/galeri", description: "Kelola foto dan video lingkungan." },
    { title: "Kamera CCTV", icon: Camera, href: "/admin/cctv", description: "Kelola akses kamera dan stream CCTV." },
    { title: "Pusat Dokumen", icon: FileText, href: "/admin/dokumen", description: "Kelola dokumen yang dapat diunduh warga." },
    { title: "Pesan Masuk", icon: MessageSquare, href: "/admin/kontak", description: `${unreadMessagesCount} pesan baru belum dibaca.`, highlight: unreadMessagesCount > 0 },
    { title: "Pengaturan Kontak", icon: Phone, href: "/admin/kontak", description: "Kelola alamat, telepon, dan peta." },
    { title: "Pengaturan Email", icon: Mail, href: "/admin/email", description: "Kelola pengiriman notifikasi via Gmail." },
    { title: "Pengaturan Drive", icon: HardDrive, href: "/admin/drive", description: "Kelola penyimpanan Google Drive." },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang di Panel Admin Kampungku. Pilih menu di bawah untuk mengelola konten website.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {summaryCards.map((card, idx) => (
            <Link key={idx} href={card.href}>
              <Card className={`h-full hover:shadow-md transition-shadow cursor-pointer ${card.highlight ? 'border-primary' : 'border-border'}`}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`p-2 rounded-lg ${card.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm ${card.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
