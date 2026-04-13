import { useState } from "react";
import { useVerifyCctvPassword, useListCctvCameras, useGetCctvSettings } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, LockKeyhole } from "lucide-react";

export default function Cctv() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const { data: settings } = useGetCctvSettings();
  const { data: cameras, isLoading: isLoadingCameras } = useListCctvCameras({ query: { enabled: isAuthenticated } });
  
  const verifyMutation = useVerifyCctvPassword();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password tidak boleh kosong");
      return;
    }
    
    verifyMutation.mutate(
      { data: { password } },
      {
        onSuccess: (res) => {
          if (res.success) {
            setIsAuthenticated(true);
            setError("");
          } else {
            setError("Password salah");
          }
        },
        onError: () => {
          setError("Gagal memverifikasi password");
        }
      }
    );
  };

  return (
    <MainLayout>
      <div className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            {settings?.pageTitle || "Kamera CCTV Lingkungan"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings?.pageDescription || "Akses kamera CCTV untuk warga perumahan. Masukkan password untuk melanjutkan."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col">
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Card className="w-full max-w-md shadow-lg border-primary/20">
              <CardHeader className="text-center pb-8 pt-10">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <LockKeyhole className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-serif">Akses Terlindungi</CardTitle>
                <CardDescription className="text-base mt-2">
                  Silakan masukkan password warga untuk melihat kamera CCTV.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password Warga</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Masukkan password..." 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={verifyMutation.isPending}>
                    {verifyMutation.isPending ? "Memverifikasi..." : "Akses Kamera"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Camera className="text-primary" /> Kamera Tersedia
              </h2>
              <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
                Kunci Kembali
              </Button>
            </div>
            
            {isLoadingCameras ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-video bg-muted rounded-xl"></div>
                ))}
              </div>
            ) : !cameras || cameras.length === 0 ? (
              <div className="text-center py-24 bg-muted/20 rounded-2xl border border-border border-dashed">
                <p className="text-muted-foreground">Belum ada kamera CCTV yang diatur.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cameras.filter(c => c.isActive !== false).map(camera => (
                  <Card key={camera.id} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-black relative">
                      <iframe 
                        src={camera.streamUrl} 
                        title={camera.name}
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        LIVE
                      </div>
                    </div>
                    <div className="p-4 bg-card">
                      <h3 className="font-bold text-lg">{camera.name}</h3>
                      {camera.location && (
                        <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                          {camera.location}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
