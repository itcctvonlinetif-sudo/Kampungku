import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public Pages
import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Cctv from "@/pages/cctv";
import Contact from "@/pages/contact";
import Documents from "@/pages/documents";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBerandaSettings from "@/pages/admin/beranda-settings";
import AdminGaleriSettings from "@/pages/admin/galeri-settings";
import AdminCctvSettings from "@/pages/admin/cctv-settings";
import AdminKontakSettings from "@/pages/admin/kontak-settings";
import AdminEmailSettings from "@/pages/admin/email-settings";
import AdminDriveSettings from "@/pages/admin/drive-settings";
import AdminDokumenSettings from "@/pages/admin/dokumen-settings";
import AdminPassword from "@/pages/admin/password";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/galeri" component={Gallery} />
      <Route path="/cctv" component={Cctv} />
      <Route path="/kontak" component={Contact} />
      <Route path="/dokumen" component={Documents} />
      
      {/* Admin Login */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Protected Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/beranda" component={AdminBerandaSettings} />
      <Route path="/admin/galeri" component={AdminGaleriSettings} />
      <Route path="/admin/cctv" component={AdminCctvSettings} />
      <Route path="/admin/kontak" component={AdminKontakSettings} />
      <Route path="/admin/email" component={AdminEmailSettings} />
      <Route path="/admin/drive" component={AdminDriveSettings} />
      <Route path="/admin/dokumen" component={AdminDokumenSettings} />
      <Route path="/admin/password" component={AdminPassword} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
