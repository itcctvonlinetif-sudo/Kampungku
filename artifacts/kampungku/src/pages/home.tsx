import { useGetHomepageSettings } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/main-layout";
import { convertDriveUrlToEmbed } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

type CardItem = {
  icon?: string;
  title: string;
  description: string;
  imageUrl?: string;
};

type HomepageSection = {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  imagePosition?: "left" | "right" | "center";
  bgStyle?: "default" | "muted" | "primary";
  position: "above" | "below";
  order: number;
  items?: CardItem[];
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

// "Above" section: text + optional image layout
function AboveSection({ section }: { section: HomepageSection }) {
  const bgClass =
    section.bgStyle === "primary"
      ? "bg-primary text-primary-foreground"
      : section.bgStyle === "muted"
      ? "bg-muted/40"
      : "bg-background";

  const imageUrl = section.imageUrl ? convertDriveUrlToEmbed(section.imageUrl, "image") : null;
  const imagePos = section.imagePosition || "right";
  const textColor = section.bgStyle === "primary" ? "text-primary-foreground" : "text-foreground";
  const subColor = section.bgStyle === "primary" ? "text-primary-foreground/80" : "text-muted-foreground";

  return (
    <section className={`py-20 md:py-28 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {imagePos === "center" ? (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-3xl md:text-4xl font-serif font-bold mb-4 ${textColor}`}>{section.title}</h2>
            {section.subtitle && <p className={`text-lg mb-8 ${subColor}`}>{section.subtitle}</p>}
            {imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-xl mb-8 aspect-[16/7]">
                <img src={imageUrl} alt={section.title} className="w-full h-full object-cover" />
              </div>
            )}
            {section.content && (
              <p className={`text-base leading-relaxed whitespace-pre-line ${subColor}`}>{section.content}</p>
            )}
          </div>
        ) : (
          <div className={`flex flex-col ${imagePos === "left" ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 lg:gap-20`}>
            <div className="w-full md:w-1/2">
              <h2 className={`text-3xl md:text-4xl font-serif font-bold mb-4 ${textColor}`}>{section.title}</h2>
              {section.subtitle && <p className={`text-lg mb-6 ${subColor}`}>{section.subtitle}</p>}
              {section.content && (
                <p className={`text-base leading-relaxed whitespace-pre-line ${subColor}`}>{section.content}</p>
              )}
            </div>
            {imageUrl && (
              <div className="w-full md:w-1/2">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                  <img src={imageUrl} alt={section.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// "Below" section: card grid layout identical to Fasilitas & Keunggulan
function BelowSection({ section }: { section: HomepageSection }) {
  const bgClass =
    section.bgStyle === "primary"
      ? "bg-primary"
      : section.bgStyle === "muted"
      ? "bg-muted/30"
      : "bg-background";

  const titleColor = section.bgStyle === "primary" ? "text-primary-foreground" : "text-foreground";
  const dividerColor = section.bgStyle === "primary" ? "bg-primary-foreground/40" : "bg-primary";

  const items = section.items || [];
  if (items.length === 0) return null;

  return (
    <section className={`py-20 md:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-serif font-bold mb-4 ${titleColor}`}>
            {section.title}
          </h2>
          <div className={`w-24 h-1 mx-auto rounded-full ${dividerColor}`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col"
            >
              {item.imageUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={convertDriveUrlToEmbed(item.imageUrl, "image")}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                {item.icon && (
                  <div className="inline-flex items-center gap-1.5 text-primary bg-primary/10 rounded-md px-2.5 py-1 text-sm font-medium mb-4 w-fit">
                    <DynamicIcon name={item.icon} className="w-4 h-4" />
                    <span>{item.icon}</span>
                  </div>
                )}
                <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: settings, isLoading } = useGetHomepageSettings();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const bgImageUrl = settings?.heroImageUrl ? convertDriveUrlToEmbed(settings.heroImageUrl, "image") : "";

  const allSections = ((settings?.homepageSections as HomepageSection[]) || []);
  const aboveSections = [...allSections].filter((s) => s.position === "above").sort((a, b) => a.order - b.order);
  const belowSections = [...allSections].filter((s) => s.position === "below").sort((a, b) => a.order - b.order);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section
        className="relative py-32 md:py-48 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 max-w-4xl mx-auto leading-tight">
            {settings?.heroTitle || "Selamat Datang di Kampungku"}
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-200">
            {settings?.heroSubtitle || "Lingkungan asri, aman, dan nyaman untuk keluarga Anda."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base w-full sm:w-auto" asChild>
              <Link href="/kontak">Hubungi Pengelola</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white" asChild>
              <Link href="/galeri">Lihat Galeri</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {settings?.statsItems && settings.statsItems.length > 0 && (
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {settings.statsItems.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-5xl font-bold font-serif mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base opacity-80 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                {settings?.aboutImageUrl ? (
                  <img
                    src={convertDriveUrlToEmbed(settings.aboutImageUrl, "image")}
                    alt="Tentang Kampungku"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    Gambar Tentang Kami
                  </div>
                )}
                <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground">
                {settings?.aboutTitle || "Tentang Kampungku"}
              </h2>
              <div className="prose prose-lg text-muted-foreground mb-8">
                <p className="whitespace-pre-line">{settings?.aboutText || "Belum ada deskripsi."}</p>
              </div>
              <Button variant="link" className="px-0 text-primary font-semibold hover:text-primary/80" asChild>
                <Link href="/galeri" className="flex items-center gap-2">
                  Lihat Lingkungan Kami <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Custom sections: ABOVE Fasilitas */}
      {aboveSections.map((section) => (
        <AboveSection key={section.id} section={section} />
      ))}

      {/* Fasilitas & Keunggulan */}
      {settings?.features && settings.features.length > 0 && (
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                {settings?.featuresTitle || "Fasilitas & Keunggulan"}
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.features.map((feature: { icon?: string; title: string; description: string; imageUrl?: string }, idx: number) => (
                <div key={idx} className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col">
                  {feature.imageUrl && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted flex-shrink-0">
                      <img src={convertDriveUrlToEmbed(feature.imageUrl, "image")} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {feature.icon && (
                      <div className="inline-flex items-center gap-1.5 text-primary bg-primary/10 rounded-md px-2.5 py-1 text-sm font-medium mb-4 w-fit">
                        <DynamicIcon name={feature.icon} className="w-4 h-4" />
                        <span>{feature.icon}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom sections: BELOW Fasilitas — card grid format */}
      {belowSections.map((section) => (
        <BelowSection key={section.id} section={section} />
      ))}
    </MainLayout>
  );
}
