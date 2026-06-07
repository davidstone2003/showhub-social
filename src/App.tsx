import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BreedersPage from "./pages/BreedersPage";
import SpeciesHubPage from "./pages/SpeciesHubPage";
import BreederCategoryPage from "./pages/BreederCategoryPage";
import SiresPage from "./pages/SiresPage";
import AnimalPage from "./pages/AnimalPage";
import SirePage from "./pages/SirePage";
import WinnersPage from "./pages/WinnersPage";
import LivePage from "./pages/LivePage";
import { MarketPage, HaulersPage } from "./pages/PlaceholderPage";
import SalesPage from "./pages/SalesPage";
import SireCatalogPage from "./pages/SireCatalogPage";
import SubmitWinnerPage from "./pages/SubmitWinnerPage";
import CreatePostPage from "./pages/CreatePostPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BreederProfilePage from "./pages/BreederProfilePage";
import AdminPage from "./pages/AdminPage";
import PricingPage from "./pages/PricingPage";
import OnboardingPage from "./pages/OnboardingPage";
import AccountTypePage from "./pages/AccountTypePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import SavedPage from "./pages/SavedPage";
import LambPublicPage from "./pages/LambPublicPage";
import DashboardPage from "./pages/DashboardPage";
import LambRegisterPage from "./pages/LambRegisterPage";
import MyLambsPage from "./pages/MyLambsPage";

import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/index" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/breeders" element={<BreedersPage />} />
            <Route path="/breeders/:species" element={<SpeciesHubPage />} />
            <Route path="/breeders/:species/:category" element={<BreederCategoryPage />} />
            <Route path="/sires" element={<SiresPage />} />
            <Route path="/animal/:id" element={<AnimalPage />} />
            <Route path="/sire/:id" element={<SirePage />} />
            <Route path="/winners" element={<WinnersPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/live/:showId" element={<LivePage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/haulers" element={<HaulersPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/repo" element={<SireCatalogPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/submit" element={<CreatePostPage />} />
            <Route path="/submit/legacy" element={<SubmitWinnerPage />} />
            <Route path="/breeder/:username" element={<BreederProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/account-type" element={<AccountTypePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/lamb/:tag" element={<LambPublicPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/lambs" element={<MyLambsPage />} />
            <Route path="/dashboard/lambs/new" element={<LambRegisterPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
