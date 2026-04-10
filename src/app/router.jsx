import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "@/auth/authStore";
import DashboardLayout from "@/layout/dashboard-layout";
import Dashboard from "@/features/dashboard/dashboard";
import LoginPage from "@/pages/loginPage";
import StoreSelectionPage from "@/pages/storeSelectionPage";
import ProtectedRoute from "@/auth/protectedRoute";
import BrandPage from "@/features/masters/brand/brand-page";
import CategoryMaster from "@/features/masters/category/category-page";
import MetalPage from "@/features/masters/metal/metal-page";
import PurityPage from "@/features/masters/purity/purity-page";
import GradePage from "@/features/masters/grade/grade-page";
import DesignPage from "@/features/masters/design/design-page";
import StorePage from "@/features/store/store-page";
import ProductPage from "@/features/masters/product/product-page";
import ItemPage from "@/features/masters/item/item-page";
import StonePage from "@/features/masters/stone/stone-page";
import EmployeePage from "@/features/masters/employee/employee-page";
import PartyTypePage from "@/features/masters/party-type/party-type-page";
import PartyPage from "@/features/masters/party/party-page";
import PartyOpeningPage from "@/features/masters/party-opening/party-opening-page";
import RatePage from "@/features/accounts/rate/rate-page";
import PurchasePage from "@/features/purchase/ornament/purchase-page";
import OldPurchasePage from "@/features/purchase/old/old-purchase-page";
import BullionPurchasePage from "@/features/purchase/bullion/bullion-purchase-page";
import BarcodingPage from "@/features/barcoding/goldornament/gold-barcoding-page";
import DiamondBarcodingPage from "@/features/barcoding/diamond/dimond-barcoding-page";
import MrpBarcodingPage from "@/features/barcoding/mrp/mrp-barcoding-page";
import BrandedBarcodingPage from "@/features/barcoding/branded/branded-barcoding-page";
import StockSummaryPage from "@/features/inventory/summary/stock-summary-page";
import ItemStatusPage from "@/features/inventory/itemstatus/ItemStatusPage";
import StockPage from "@/features/inventory/add-stock/stock-page";
import TransferPage from "@/features/inventory/counter-transfer/transfer-page";
import SalesPage from "@/features/sales/sale-estimate/sales-estimate-page";
import AdvancePage from "@/features/advance/advance-page";
import PaymentPage from "@/features/accounts/payment/payment-page";
import ReceiptPage from "@/features/accounts/receipt/receipt-page";
import JournalPage from "@/features/accounts/journal/journal-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/select-store",
    element: (
      <ProtectedRoute>
        <StoreSelectionPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [ 
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      {path:"masters/brand",element:<BrandPage/>},
      {path:"masters/category",element:<CategoryMaster/>},
      {path:"masters/metal",element:<MetalPage/>},
      { path: "masters/purity", element: <PurityPage /> },
      { path: "masters/grade", element: <GradePage/> },
      { path: "masters/design", element: <DesignPage /> },
      { path: "masters/product", element: <ProductPage />},
      {path:"masters/item", element: <ItemPage />},
      {path:"masters/stone",element:<StonePage />},
      {path:"masters/employee",element:<EmployeePage />},
      {path:"masters/partytype",element:<PartyTypePage />},
      {path:"masters/party",element:<PartyPage />},
      {path:"masters/openingbalance",element:<PartyOpeningPage />},
      // rate master routes
      {path:"accounts/rate",element:<RatePage />},
      // purchase routes 
      {path:"purchase/ornament",element:<PurchasePage />},
      {path:"purchase/old",element:<OldPurchasePage />},
      {path:"purchase/bullion",element:<BullionPurchasePage/>},

      // barcoding routes will be added here
      {path:"barcoding/gold",element:<BarcodingPage/>},
      {path:"barcoding/diamond",element:<DiamondBarcodingPage/>},
      {path:"barcoding/mrp",element:<MrpBarcodingPage/>},
      {path:"barcoding/branded",element:<BrandedBarcodingPage/>},
      // inventory routes
      {path:"inventory/stock",element:<StockSummaryPage/>},
      {path:"inventory/itemstatus",element:<ItemStatusPage/>},
      {path:"inventory/additem",element:<StockPage/>},
      // counter transfer route will be added here
      {path:"stock/transfer", element:<TransferPage/>},
      // sales routes will be added here
      {path:"sales/estimate", element:<SalesPage/>},
      // advance routes will be added here
      {path:"advance/recieve", element:<AdvancePage/>},
      // accounts routes will be added here
      {path:"accounts/payment", element:<PaymentPage/>},
      {path:"accounts/receipt", element:<ReceiptPage/>},
      {path:"accounts/journal", element:<JournalPage/>},
    ],
  },
]);