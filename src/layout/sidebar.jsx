import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Boxes, Users, ChevronDown, ChartLine,Barcode,ArrowLeftRight, Wallet, ShoppingBag,BookOpen,NotepadText  } from "lucide-react";

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
        { name: "Product Master", path: "/masters/product"},
        { name: "Item Master", path: "/masters/item"},
        { name: "Stone Master", path: "/masters/stone" },
        { name: "Employee Master", path: "/masters/employee"},
        { name: "Party Type Master", path: "/masters/partytype"},
        { name: "Party Master", path: "/masters/party"},
        { name: "Party Opening Bal.", path: "/masters/openingbalance"},
        
        
      ],
    },
    {
      name:"Rate Master",
      icon:ChartLine,
      children:[
        {name:"Rate Master",path:"accounts/rate"}
      ]
    },
    {
      name: "Purchase",
      icon: ShoppingCart,
      children:[
        {name:"Ornament Purchase",path:"purchase/ornament"},
        {name:"Old Purchase",path:"purchase/old"},
        {name:"Bullion Purchase",path:"purchase/bullion"}
      ]
    },
    {
      name: "Barcoding",
      icon: Barcode,
      children:[
        {name:"Gold Ornament",path:"barcoding/gold"},
        {name:"Dimond Ornament",path:"barcoding/diamond"},
        {name:"MRP Barcoding",path:"barcoding/mrp"},
        {name:"Branded Ornament",path:"barcoding/branded"}
      ]
    },
    {
      name: "Inventory",
      icon: Boxes,
      children: [
        { name: "Stock Summary", path: "inventory/stock" },
        { name: "Item Status", path: "inventory/itemstatus"},
        { name: "Add Stock", path: "inventory/additem" },
      ],
    },
    {
      name: "Stock Movement",
      icon: ArrowLeftRight,
      children:[
        {name:"Counter Transfer", path:"stock/transfer"},
        
      ]
    },
    {
      name: "Sales",
      icon: ShoppingBag,
      children:[
        {name:"Sales Estimate", path:"sales/estimate"},
        {name:"Sales Invoice", path:"sales/invoice"},
      ]
    },
    {
      name: "Advance ",
      icon: Wallet,
      children:[
        {name:"Advance Recieve", path:"advance/recieve"},
      ]
    },
     {
      name: "Accounting",
      icon: BookOpen,
      children:[
        {name:"Journal Entry", path:"accounts/journal"},
        {name:"Payment Voucher", path:"accounts/payment"},
        {name:"Receipt Voucher", path:"accounts/receipt"},
      ]
    },
      {
      name: "Reports",
      icon: NotepadText,
      children:[
        {name:"Sales Summary", path:"report/sales-summary"},
        {name:"Purchase Register", path:"report/purchase-register"},
        {name:"Old Purchase Reg.", path:"report/old-purchase"},
        {name:"Advance Register", path:"report/advance-register"},
        {name:"Sales Register", path:"report/sales-register"},
        {name:"Old Stock Reg.", path:"report/old-stock-register"},
        {name:"Pure Metal Reg.", path:"report/metal-register"},
      ]
    },
  ];

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4 overflow-hidden">
      <div className="text-xl font-bold mb-6 flex-shrink-0">JewelERP</div>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <div key={item.name}>
            {/* Main Menu */}
            {item.children ? (
              <div>
                <div
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer flex-shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ChevronDown size={16} className="flex-shrink-0" />
                </div>

                {/* Sub Menu */}
                {openMenu === item.name && (
                  <div className="ml-8 flex flex-col gap-1">
                    {item.children.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `p-2 rounded hover:bg-slate-800 flex-shrink-0 ${
                            isActive ? "bg-slate-800" : ""
                          }`
                        }
                      >
                        <span className="truncate">{sub.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 flex-shrink-0 ${
                    isActive ? "bg-slate-800" : ""
                  }`
                }
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 