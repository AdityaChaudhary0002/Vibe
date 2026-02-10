import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, Moon, Sun } from "lucide-react";
import { UserButton, useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
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
    <div
      className={`w-60 xl:w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"} transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        <div
          className="flex items-center gap-2 ml-7 my-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={assets.logo}
            alt="Vibe"
            className="w-10"
          />
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-white">
            Vibe
          </h1>
        </div>
        <hr className="border-gray-300 dark:border-gray-700 mb-8" />

        <MenuItems setSidebarOpen={setSidebarOpen} />

        <Link
          to={"/create-post"}
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="size-5" />
          Create Post
        </Link>
      </div>

      <div className="w-full border-t border-gray-200 dark:border-gray-700 p-4 px-7 flex flex-col gap-4">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center cursor-pointer">
            <UserButton />
            <div>
              <h1 className="text-sm font-medium dark:text-white">
                {user.full_name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
            </div>
          </div>
          <LogOut
            onClick={signOut}
            className="w-4.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
          />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
