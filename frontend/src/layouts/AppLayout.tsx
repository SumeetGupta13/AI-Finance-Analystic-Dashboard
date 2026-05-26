import { Outlet } from 'react-router-dom';
import MobileNav from '../components/common/MobileNav';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <Sidebar />
      <div className="min-w-0 lg:pl-72">
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-65px)] w-full min-w-0 max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
