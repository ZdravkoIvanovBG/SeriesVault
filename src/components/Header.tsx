import { Link, useLocation } from "react-router-dom";
import { Tv, Eye, Search, Bookmark, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useSeriesContext } from "@/context/SeriesContext";

const Header = () => {
  const location = useLocation();
  const { watchedIds, watchlistIds } = useSeriesContext();

  const links = [
    { to: "/", label: "Discover", icon: Search },
    { to: "/watched", label: "Watched", icon: Eye, count: watchedIds.size },
    { to: "/tier-list", label: "Tier List", icon: Layers },
    { to: "/watchlist", label: "Watchlist", icon: Bookmark, count: watchlistIds.size },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-border">
            <Tv className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Series<span className="text-gradient">Vault</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                    {link.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
