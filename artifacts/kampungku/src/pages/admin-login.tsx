import { useState } from "react";
import { useAdminLogin, useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Info } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();
  const queryClient = useQueryClient();
  
  const { data: adminMe } = useGetAdminMe({ query: { retry: false } });
  if (adminMe?.isAuthenticated) {
    if ((adminMe as any).needsPasswordSetup) {
      setLocation("/admin/password");
    } else {
      setLocation("/admin");
    }
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (res) => {
          if (res.success) {
            queryClient.invalidateQueries();
            if ((res as any).needsPasswordSetup) {
              toast({
                title: "Login Berhasil",
                description: "Silakan buat password baru untuk mengamankan akun Anda.",
              });
              setLocation("/admin/password");
            } else {
              toast({
                title: "Login Berhasil",
                description: "Selamat datang di Panel Admin Kampungku.",
              });
              setLocation("/admin");
            }
          } else {
            toast({
              variant: "destructive",
              title: "Login Gagal",
              description: res.message || "Username atau password salah.",
            });
          }
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Login Gagal",
            description: "Terjadi kesalahan sistem. Silakan coba lagi.",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Kampungku</CardTitle>
          <CardDescription>
            Masukkan username untuk mengakses panel kontrol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Jika baru pertama kali masuk, gunakan username <strong>admin</strong> dan biarkan password kosong. Anda akan diminta membuat password setelah login.</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika belum pernah set password"
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
