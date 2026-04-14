import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useListCustomPages } from "@/hooks/use-custom-pages";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: customPages } = useListCustomPages();

  const navPages = customPages?.filter(p => p.isPublished && p.showInNav) || [];

  const staticLinks = [
    { href: "/", label: "Beranda" },
    { href: "/galeri", label: "Galeri" },
    { href: "/cctv", label: "CCTV" },
    { href: "/dokumen", label: "Dokumen" },
    { href: "/kontak", label: "Kontak" },
  ];

  const allLinks = [
    ...staticLinks,
    ...navPages.map(p => ({ href: `/halaman/${p.slug}`, label: p.title })),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-primary">Kampungku</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  location === link.href
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/login">Admin</Link>
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t bg-background py-3 px-4 flex flex-col gap-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/login" onClick={() => setMobileOpen(false)}>Admin Login</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-serif font-bold text-foreground mb-3">Kampungku</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Perumahan nyaman, asri, dan aman untuk keluarga Anda. Bersama membangun komunitas yang harmonis.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Navigasi</h3>
              <div className="flex flex-col gap-2">
                {staticLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Informasi</h3>
              <div className="flex flex-col gap-2">
                {navPages.map(p => (
                  <Link key={p.slug} href={`/halaman/${p.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {p.title}
                  </Link>
                ))}
                <Link href="/dokumen" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Unduh Dokumen
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Kampungku. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
