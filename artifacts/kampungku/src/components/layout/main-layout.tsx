import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/galeri", label: "Galeri" },
    { href: "/cctv", label: "CCTV" },
    { href: "/dokumen", label: "Dokumen" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-primary">Kampungku</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex">
             <Button asChild variant="outline" size="sm">
               <Link href="/admin/login">Admin Login</Link>
             </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t bg-muted">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kampungku. Hak cipta dilindungi.
          </p>
          <div className="flex gap-4">
             <Link href="/kontak" className="text-sm text-muted-foreground hover:text-primary transition-colors">Hubungi Kami</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
