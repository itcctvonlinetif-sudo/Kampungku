import { useState } from "react";
import { useListGalleryImages, useListGalleryVideos } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoEmbed } from "@/components/video-embed";
import { convertDriveUrlToEmbed } from "@/lib/utils";

export default function Gallery() {
  const { data: images, isLoading: isLoadingImages } = useListGalleryImages();
  const { data: videos, isLoading: isLoadingVideos } = useListGalleryVideos();
  const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null);

  return (
    <MainLayout>
      <div className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Galeri Kampungku</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kumpulan momen, kegiatan, dan pemandangan lingkungan di perumahan kami.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="images" className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="images" className="text-base">Foto</TabsTrigger>
              <TabsTrigger value="videos" className="text-base">Video</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="images" className="mt-0">
            {isLoadingImages ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[4/3] bg-muted rounded-xl"></div>
                ))}
              </div>
            ) : !images || images.length === 0 ? (
              <div className="text-center py-24 bg-muted/20 rounded-2xl border border-border border-dashed">
                <p className="text-muted-foreground">Belum ada foto di galeri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.map(item => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setLightbox({ url: convertDriveUrlToEmbed(item.url, "image"), title: item.title })}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={convertDriveUrlToEmbed(item.url, "image")}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white font-bold text-lg">{item.title}</h3>
                      {item.description && (
                        <p className="text-white/80 text-sm mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            {isLoadingVideos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="aspect-video bg-muted rounded-xl"></div>
                ))}
              </div>
            ) : !videos || videos.length === 0 ? (
              <div className="text-center py-24 bg-muted/20 rounded-2xl border border-border border-dashed">
                <p className="text-muted-foreground">Belum ada video di galeri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {videos.map(item => (
                  <div key={item.id} className="bg-card rounded-xl overflow-hidden shadow-md border border-border flex flex-col">
                    <div className="aspect-video bg-muted relative">
                      <VideoEmbed url={item.url} title={item.title} className="w-full h-full" />
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="font-bold text-xl mb-2 text-foreground font-serif">{item.title}</h3>
                      {item.description && (
                        <p className="text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white text-lg font-bold hover:text-gray-300 transition-colors"
            >
              Tutup X
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.title}
              className="w-full rounded-xl max-h-[80vh] object-contain"
            />
            <p className="text-white text-center mt-4 font-semibold">{lightbox.title}</p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
