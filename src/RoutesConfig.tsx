import React from "react";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import path from "path";

// Lazy Loading للصفحات
const Products = React.lazy(() => import("@/pages/Products"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const SellProduct = React.lazy(() => import("@/pages/SellProduct"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Login = React.lazy(() => import("@/pages/Login"));
const SignUp = React.lazy(() => import("@/pages/SignUp"));
const Suppliers = React.lazy(() => import("@/pages/Suppliers"));
const Customers = React.lazy(() => import("@/pages/Customers"));
const UnauthorizedPage = React.lazy(() => import("@/pages/Unauthorized"));
const FinancialStatement = React.lazy(() => import("@/pages/FinancialStatement"));
const CustomerDetails = React.lazy(() => import("@/pages/CustomerDetails"));
const SupplierDetails = React.lazy(() => import("@/pages/SupplierDetails"));
const ProductDetails = React.lazy(() => import("@/pages/ProductDetails"));
const Exchange = React.lazy(() => import("@/pages/Exchange"));
const Warehouses = React.lazy(() => import("@/pages/Warehouses"));
const SellDetails = React.lazy(() => import("@/pages/SellDetails"));
const WarehousesDetails = React.lazy(() => import("@/pages/WarehousesDetails"));
const Categories = React.lazy(() => import("@/pages/Categories"));
const CategoryDetails = React.lazy(() => import("@/pages/CategoryDetails"));
const ChartAccount = React.lazy(()=> import('@/pages/ChartAccount'))
const ChartAccountDetails = React.lazy(()=> import('@/pages/ChartAccountDetails'))
const JournalEntries = React.lazy(()=> import('@/pages/JournalEntries'))
const TrialBalance = React.lazy(()=> import('@/pages/TrialBalance'))
const GeneralLedger = React.lazy(()=> import('@/pages/GeneralLedger'))
const IncomeStatement = React.lazy(()=> import('@/pages/IncomeStatement'))
const ProfitAnalysis = React.lazy(()=> import('@/pages/ProfitAnalysis'))
const InventoryBalances = React.lazy(()=> import('@/pages/InventoryBalances'))
// const Purchases =React.lazy(()=> import('@/pages/Purchases'))
  const AskAi = React.lazy(() => import('@/pages/AskAi'))
import AiReports from "@/pages/AiReports";


export const routesConfig = [
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/signUp", element: <SignUp /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/Products", element: <Products />},
  { path: "/suppliers", element:  <Suppliers /> },
  { path: "/customers", element:  <Customers /> },
  { path: "/dashboard", element: <PrivateRoute allowedRoles={["admin", "user"]}><Dashboard /></PrivateRoute> },
  { path: "/sellProduct", element: <SellProduct /> },
  { path: "/financialStatement", element: <FinancialStatement /> },
  { path: "/SupplierDetails", element: <SupplierDetails /> },
  { path: "/CustomerDetails", element: <CustomerDetails /> },
  { path: "/productDetails", element: <ProductDetails /> },
  { path: "/sellDetails", element: <SellDetails /> },
  { path: "/Exchange", element: <Exchange /> },
  { path: "/warehouses", element: <Warehouses /> },
  { path: "/Warehouses/:id", element: <WarehousesDetails /> },
  { path: "/categories", element: <Categories /> },
  { path: "/categories/:id", element: <CategoryDetails /> },
  { path: "/accounts", element: <ChartAccount /> },
  {path : '/accounts/:id' , element:<ChartAccountDetails/>},
  { path: "/journal-entries", element: <JournalEntries /> },
  { path: "/trial-balance", element: <TrialBalance /> },
  { path: "/general-ledger", element: <GeneralLedger /> },
  { path: "/general-ledger/:id", element: <GeneralLedger /> },
  { path: "/income-statement", element: <IncomeStatement /> },
  { path: "/profit-analysis", element: <ProfitAnalysis /> },
  { path: "/inventory-balances", element: <InventoryBalances /> },
  { path: "/ai-reports", element: <AiReports /> },
  { path: "/ai-chat", element: <AskAi /> },
  // {path: '/purchases' , element:<Purchases/>},
  { path: "*", element: <NotFound /> }
];
