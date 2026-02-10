
import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, Moon, Sun } from "lucide-react";
import { UserButton, useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const Sidebar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
      <div className="w-full">
        <div
          className="flex items-center gap-2 px-6 py-5 cursor-pointer"
          onClick={() => {
            navigate("/");
            setSidebarOpen && setSidebarOpen(false);
          }}
        >
          <img
            src={assets.logo}
            alt="Vibe"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Vibe
          </h1>
        </div>

        <div className="px-6 mb-6">
          <hr className="border-gray-100 dark:border-gray-800" />
        </div>

        <MenuItems setSidebarOpen={setSidebarOpen} />

        <Link
          to={"/create-post"}
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 py-3 mt-6 mx-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 dark:shadow-none text-white font-medium cursor-pointer"
        >
          <CirclePlus className="size-5" />
          Create Post
        </Link>
      </div>

      <div className="w-full border-t border-gray-100 dark:border-gray-800 p-4 px-6 flex flex-col gap-4 bg-gray-50/50 dark:bg-slate-800/20">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center group cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="ring-2 ring-transparent group-hover:ring-indigo-100 dark:group-hover:ring-slate-700 rounded-full transition-all">
              <UserButton />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-slate-700 dark:text-white truncate">
                {user.full_name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Appearance
          </span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md"
          >
            {theme === "light" ? (
              <>
                <Moon className="size-4 text-slate-600" />
                <span className="text-xs font-medium text-slate-600">Dark</span>
              </>
            ) : (
              <>
                <Sun className="size-4 text-yellow-400" />
                <span className="text-xs font-medium text-white">Light</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
