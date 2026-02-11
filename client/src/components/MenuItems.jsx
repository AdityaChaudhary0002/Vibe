import React, { useEffect, useState } from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

const MenuItems = ({ setSidebarOpen }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { getToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = await getToken();
        // Use POST as defined in routes
        const { data } = await api.post("/api/user/unread-notifications", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    };
    fetchUnreadCount();

    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);

  }, [location.pathname]);

  return (
    <div className="px-6 text-gray-600 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3.5 py-2 flex items-center gap-3 rounded-xl relative ${isActive
              ? "bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-white"
              : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            }`
          }
        >
          <div className="relative">
            <Icon className="size-5" />
            {label === "Notifications" && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white dark:border-slate-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          {label}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
