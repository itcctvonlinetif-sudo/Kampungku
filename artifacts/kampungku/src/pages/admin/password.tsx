import { AdminLayout } from "@/components/layout/admin-layout";
import { useAdminChangePassword } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";

export default function AdminPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const mutation = useAdminChangePassword();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Password baru dan konfirmasi tidak cocok." });
      return;
    }
    
    mutation.mutate(
      { data: { currentPassword, newPassword } },
      {
        onSuccess: () => {
          toast({ title: "Berhasil", description: "Password admin berhasil diubah." });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
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
          <Key className="w-6 h-6" /> Ganti Password Admin
        </h1>
        <p className="text-muted-foreground">Pastikan Anda menggunakan password yang kuat untuk keamanan sistem.</p>
      </div>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Ubah Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password Saat Ini</Label>
              <Input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password Baru</Label>
              <Input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Ubah Password"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </AdminLayout>
  );
}
