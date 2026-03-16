// @ts-nocheck
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PassengerSidebar from '../../components/passenger/PassengerSidebar';
import PassengerTopbar from '../../components/passenger/PassengerTopbar';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const pageTitles: Record<string, string> = {
  '/student': 'Overview',
  '/student/overview': 'Overview',
  '/student/reserve': 'Reserve a Seat',
  '/student/reservations': 'My History',
  '/student/settings': 'Settings',
};

const PassengerLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';
  useDocumentTitle(`${title} — Fleetmark 1337`);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <PassengerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`transition-all duration-200 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[216px]'
        }`}
      >
        <PassengerTopbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6" key={location.pathname}>
          <div className="animate-page-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PassengerLayout;
