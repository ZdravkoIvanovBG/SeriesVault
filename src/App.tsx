import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeriesProvider } from "@/context/SeriesContext";
import Header from "@/components/Header";
import SeriesDetail from "./pages/SeriesDetail";
import Index from "./pages/Index";
import Watched from "./pages/Watched";
import Watchlist from "./pages/Watchlist";
import TierList from "./pages/TierList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SeriesProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/watched" element={<Watched />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/tier-list" element={<TierList />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SeriesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
