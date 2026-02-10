import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";

const MenuItems = ({ setSidebarOpen }) => {
  return (
    <div className="px-6 text-gray-600 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3.5 py-2 flex items-center gap-3 rounded-xl ${isActive
              ? "bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-white"
              : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            }`
          }
        >
          <Icon className="size-5" />
          {label}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
