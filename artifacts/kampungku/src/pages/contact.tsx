import { useState } from "react";
import { useGetContactSettings, useSendContactMessage } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { data: settings, isLoading: isLoadingSettings } = useGetContactSettings();
  const sendMessageMutation = useSendContactMessage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          toast({
            title: "Pesan Terkirim",
            description: "Terima kasih. Kami akan segera menghubungi Anda kembali.",
          });
          setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: ""
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Gagal Mengirim",
            description: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.",
          });
        }
      }
    );
  };

  return (
    <MainLayout>
      <div className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Hubungi Kami</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Silakan kirim pesan atau hubungi kantor pengelola untuk informasi lebih lanjut.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Info & Map */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold border-b pb-4">Informasi Kantor</h2>
              
              {isLoadingSettings ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-6 bg-muted rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-5">
                  {settings?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-muted-foreground mb-1 uppercase tracking-wider">Alamat</h4>
                        <p className="text-foreground leading-relaxed">{settings.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {settings?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-muted-foreground mb-1 uppercase tracking-wider">Telepon / WhatsApp</h4>
                        <p className="text-foreground">{settings.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {settings?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-muted-foreground mb-1 uppercase tracking-wider">Email</h4>
                        <p className="text-foreground">{settings.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {settings?.officeHours && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-muted-foreground mb-1 uppercase tracking-wider">Jam Operasional</h4>
                        <p className="text-foreground whitespace-pre-line">{settings.officeHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {settings?.mapEmbedUrl && (
              <div className="rounded-xl overflow-hidden border border-border shadow-sm aspect-square md:aspect-[4/3]">
                <iframe
                  src={settings.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi"
                ></iframe>
              </div>
            )}
          </div>
          
          {/* Form */}
          <div className="lg:col-span-3">
            <Card className="border-border shadow-md">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif font-bold mb-6">Kirim Pesan</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange}
                        placeholder="0812xxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subjek</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange}
                        placeholder="Pertanyaan Fasilitas"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      required 
                      rows={6}
                      value={formData.message} 
                      onChange={handleChange}
                      placeholder="Tuliskan pesan Anda di sini..."
                      className="resize-none"
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={sendMessageMutation.isPending}>
                    {sendMessageMutation.isPending ? "Mengirim..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
