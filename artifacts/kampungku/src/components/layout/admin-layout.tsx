import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAdminLogout } from "@workspace/api-client-react";
import { Home, Image as ImageIcon, Video, Phone, Mail, HardDrive, FileText, Key, LogOut, LayoutDashboard, Camera } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, username, isLoading } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useAdminLogout();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!isAuthenticated) {
    return null; // The hook redirects to /admin/login
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin/login");
      }
    });
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/beranda", icon: Home, label: "Beranda" },
    { href: "/admin/galeri", icon: ImageIcon, label: "Galeri" },
    { href: "/admin/cctv", icon: Camera, label: "CCTV" },
    { href: "/admin/dokumen", icon: FileText, label: "Dokumen" },
    { href: "/admin/kontak", icon: Phone, label: "Kontak & Pesan" },
    { href: "/admin/email", icon: Mail, label: "Pengaturan Email" },
    { href: "/admin/drive", icon: HardDrive, label: "Pengaturan Drive" },
    { href: "/admin/password", icon: Key, label: "Ganti Password" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border md:h-screen sticky top-0 flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="text-xl font-serif font-bold text-sidebar-primary flex items-center gap-2">
            Kampungku Admin
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-sm text-sidebar-foreground mb-4 truncate px-2">
            Login sebagai: <span className="font-bold">{username}</span>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
