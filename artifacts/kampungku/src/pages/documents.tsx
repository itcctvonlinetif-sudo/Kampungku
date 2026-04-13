import { useListDocuments, useGetDocumentsPageSettings } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, FileArchive, FileSpreadsheet, FileIcon, Calendar } from "lucide-react";
import { convertDriveUrlToEmbed, formatDate } from "@/lib/utils";

export default function Documents() {
  const { data: settings } = useGetDocumentsPageSettings();
  const { data: documents, isLoading } = useListDocuments();

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="w-8 h-8 text-primary" />;
    
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes("word") || type.includes("doc")) return <FileText className="w-8 h-8 text-blue-600" />;
    if (type.includes("excel") || type.includes("xls")) return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    if (type.includes("zip") || type.includes("rar")) return <FileArchive className="w-8 h-8 text-yellow-600" />;
    
    return <FileIcon className="w-8 h-8 text-primary" />;
  };

  const getDownloadUrl = (url: string) => {
    // If it's a Google Drive preview/view URL, we might want to try to make it a download URL
    // But for simplicity, we just use the provided URL or convert it if it's a raw drive URL
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  };

  return (
    <MainLayout>
      <div className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            {settings?.pageTitle || "Pusat Dokumen"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings?.pageDescription || "Unduh dokumen penting, formulir, dan peraturan lingkungan."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="h-48 bg-muted border-none shadow-none"></Card>
            ))}
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 rounded-2xl border border-border border-dashed">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground font-medium">Belum ada dokumen yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <Card key={doc.id} className="group hover:border-primary/50 transition-colors shadow-sm hover:shadow-md flex flex-col h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/5 transition-colors">
                      {getFileIcon(doc.fileType)}
                    </div>
                    {doc.category && (
                      <Badge variant="secondary" className="font-normal bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20">
                        {doc.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 mb-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2" title={doc.title}>{doc.title}</h3>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{doc.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {doc.createdAt ? formatDate(doc.createdAt) : "-"}
                    </div>
                    <Button size="sm" variant="default" className="gap-2 shadow-sm" asChild>
                      <a href={getDownloadUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" /> Unduh
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
