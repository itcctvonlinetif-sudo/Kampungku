import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAdminLogout } from "@workspace/api-client-react";
import { Home, Image as ImageIcon, Phone, Mail, HardDrive, FileText, Key, LogOut, LayoutDashboard, Camera, Globe, Menu, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, username, isLoading } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useAdminLogout();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated) {
    return null;
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
    { href: "/admin/halaman", icon: Globe, label: "Kelola Halaman" },
    { href: "/admin/kontak", icon: Phone, label: "Kontak & Pesan" },
    { href: "/admin/email", icon: Mail, label: "Pengaturan Email" },
    { href: "/admin/drive", icon: HardDrive, label: "Pengaturan Drive" },
    { href: "/admin/password", icon: Key, label: "Ganti Password" },
  ];

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <Link href="/" className="text-lg font-serif font-bold text-sidebar-primary">
          Kampungku Admin
        </Link>
        <button className="md:hidden" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5 text-sidebar-foreground" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground mb-3 px-1 truncate">
          Login sebagai: <span className="font-bold">{username}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex-col">
        <NavContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-sidebar flex flex-col h-full">
            <NavContent />
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-sidebar-foreground" />
          </button>
          <span className="font-serif font-bold text-sidebar-primary">Kampungku Admin</span>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
