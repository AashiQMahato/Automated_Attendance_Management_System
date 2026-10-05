import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import logo from "../../assets/Logo.svg";
import { NotificationsMenu, ProfileMenu, ThemeToggle } from "./HeaderMenus";

// Translucent header that blends into the canvas; a hairline appears only
// once content scrolls underneath it.
const TopHeader = ({ config, pageName, user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass sticky top-0 z-30 border-b bg-canvas/80 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-200 ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <img src={logo} alt="" className="h-7 w-7 rounded-md md:hidden" />
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-ink-3 sm:block">{config.workspace}</li>
            <li className="hidden sm:block" aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5 text-ink-3" />
            </li>
            <li className="truncate font-medium text-ink" aria-current="page">
              {pageName}
            </li>
          </ol>
        </nav>
        <div className="flex items-center gap-1">
          <NotificationsMenu holidaysPath={config.holidaysPath} />
          <ThemeToggle />
          <div className="ml-1.5">
            <ProfileMenu user={user} settingsPath={config.settingsPath} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
