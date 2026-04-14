import { useRoute } from "wouter";
import { useGetCustomPage } from "@/hooks/use-custom-pages";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";

export default function CustomPageView() {
  const [, params] = useRoute("/halaman/:slug");
  const slug = params?.slug || "";
  const { data: page, isLoading, isError } = useGetCustomPage(slug);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !page) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground">Halaman yang Anda cari tidak ada atau telah dihapus.</p>
        </div>
      </MainLayout>
    );
  }

  if (!page.isPublished) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Halaman Tidak Tersedia</h1>
          <p className="text-muted-foreground">Halaman ini sedang dalam proses penyusunan.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-foreground">{page.title}</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div
          className="prose prose-lg max-w-4xl text-foreground"
          dangerouslySetInnerHTML={{ __html: page.content || "<p>Konten sedang disiapkan.</p>" }}
        />
      </div>
    </MainLayout>
  );
}
