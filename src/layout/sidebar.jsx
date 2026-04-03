import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Boxes, Users, ChevronDown } from "lucide-react";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Masters",
      icon: Users,
      children: [
        { name: "Brand Master", path: "/masters/brand" },
        { name: "Category Master", path: "/masters/category" },
        { name: "Metal Master", path: "/masters/metal" },
        { name: "Purity Master", path: "/masters/purity" },
        { name: "Grade Master", path: "/masters/grade" },
        { name: "Design Master", path: "/masters/design" },
      ],
    },
    {
      name: "Purchase",
      icon: ShoppingCart,
      path: "/purchase",
    },
    {
      name: "Inventory",
      icon: Boxes,
      path: "/inventory",
    },
    {
      name: "Sales",
      icon: ShoppingCart,
      path: "/sales",
    },
  ];

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen p-4">
      <div className="text-xl font-bold mb-6">JewelERP</div>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <div key={item.name}>
            {/* Main Menu */}
            {item.children ? (
              <div>
                <div
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.name}
                  </div>
                  <ChevronDown size={16} />
                </div>

                {/* Sub Menu */}
                {openMenu === item.name && (
                  <div className="ml-8 flex flex-col gap-1">
                    {item.children.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `p-2 rounded hover:bg-slate-800 ${
                            isActive ? "bg-slate-800" : ""
                          }`
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${
                    isActive ? "bg-slate-800" : ""
                  }`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 