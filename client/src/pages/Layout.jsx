import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Loading from "../components/Loading";
import { useSelector } from "react-redux";
import VoiceAssistant from "../components/VoiceAssistant";

const Layout = () => {
  const user = useSelector((state) => state.user.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return user ? (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex relative">

      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden md:block w-60 xl:w-72 h-screen fixed top-0 left-0 z-30 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900">
        <Sidebar sidebarOpen={true} setSidebarOpen={() => { }} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)}>
        <div
          className={`w-64 h-full bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full relative">
            <button
              className="absolute top-4 right-4 p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <Sidebar sidebarOpen={true} setSidebarOpen={setSidebarOpen} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {/* Offset by sidebar width on desktop (ml-60 / ml-72) */}
      <div className="flex-1 w-full min-h-screen md:ml-60 xl:ml-72">

        {/* Mobile Header / Toggle */}
        <div className="md:hidden sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Vibe</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Animated Content Wrapper */}
        <div className="h-full animate-fadeInUp" key={location.pathname}>
          <Outlet />
        </div>

        {/* Voice Assistant FAB */}
        <VoiceAssistant />
      </div>

    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
