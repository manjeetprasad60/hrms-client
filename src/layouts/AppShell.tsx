import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { storage } from '../utils/storage';
import { APP_CONFIG } from '../config/constants';

export function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return storage.get<boolean>(APP_CONFIG.SIDEBAR_COLLAPSED_STORAGE_KEY) ?? false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    storage.set(APP_CONFIG.SIDEBAR_COLLAPSED_STORAGE_KEY, isCollapsed);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const openMobileMenu = () => {
    setIsMobileOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="app-shell-vertical">
      {/* Full-width Top Header */}
      <Header onOpenMobileMenu={openMobileMenu} />

      {/* Body Area: Left Sidebar + Right Main Content */}
      <div className="app-body-layout">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={isMobileOpen}
          onCloseMobile={closeMobileMenu}
        />

        <main className="app-content-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Alias for backwards compatibility
export const AppLayout = AppShell;
