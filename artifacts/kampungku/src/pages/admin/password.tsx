import { AdminLayout } from "@/components/layout/admin-layout";
import { useAdminChangePassword, useGetAdminMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Key, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function AdminPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const mutation = useAdminChangePassword();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: adminMe } = useGetAdminMe({ query: { retry: false } });
  const isFirstSetup = (adminMe as any)?.needsPasswordSetup === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Password baru dan konfirmasi tidak cocok." });
      return;
    }
    
    mutation.mutate(
      { data: { currentPassword: isFirstSetup ? undefined : currentPassword, newPassword } as any },
      {
        onSuccess: () => {
          toast({ title: "Berhasil", description: "Password admin berhasil diubah." });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          if (isFirstSetup) {
            queryClient.invalidateQueries();
            setLocation("/admin");
          }
        },
        onError: () => {
          toast({ variant: "destructive", title: "Gagal", description: "Password lama salah atau terjadi kesalahan sistem." });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <Key className="w-6 h-6" /> {isFirstSetup ? "Buat Password Admin" : "Ganti Password Admin"}
        </h1>
        <p className="text-muted-foreground">
          {isFirstSetup
            ? "Anda belum memiliki password. Buat password baru untuk mengamankan akun admin."
            : "Pastikan Anda menggunakan password yang kuat untuk keamanan sistem."}
        </p>
      </div>

      {isFirstSetup && (
        <div className="flex items-start gap-2 p-3 mb-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300 max-w-md">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Ini adalah pengaturan pertama. Buat password yang kuat untuk melindungi panel admin Anda.</span>
        </div>
      )}

      <Card className="max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isFirstSetup ? "Buat Password Baru" : "Form Ubah Password"}</CardTitle>
            {isFirstSetup && (
              <CardDescription>Password minimal 6 karakter</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFirstSetup && (
              <div className="space-y-2">
                <Label>Password Saat Ini</Label>
                <Input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password Baru</Label>
              <Input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : isFirstSetup ? "Buat Password" : "Ubah Password"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </AdminLayout>
  );
}
