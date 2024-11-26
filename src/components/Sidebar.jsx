import { NavLink } from "react-router-dom";
import { LuLayoutDashboard, LuUsers, LuMenu, LuX } from "react-icons/lu";
import { GoPasskeyFill } from "react-icons/go";
import { useState } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LuLayoutDashboard />, path: "/" },
    { id: "users", label: "Users", icon: <LuUsers />, path: "/users" },
    { id: "roles", label: "Roles", icon: <GoPasskeyFill />, path: "/roles" },
    { id: "profile", label: "Profile", icon: <LuUsers />, path: "/profile" }, // Add profile link
  ];

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <LuX size="24px" /> : <LuMenu size="24px" />}
      </button>

      <div className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar}></div>

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-xl font-semibold">Admin Demo</span>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`
              }
              onClick={toggleSidebar}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;