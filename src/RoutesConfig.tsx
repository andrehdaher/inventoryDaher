import React from "react";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

// Lazy Loading للصفحات
const Products = React.lazy(() => import("@/pages/Products"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const SellProduct = React.lazy(() => import("@/pages/SellProduct"));
const Home = React.lazy(() => import("@/pages/Home"));
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
const Purchases =React.lazy(()=> import('@/pages/Purchases'))
//   const AskAi = React.lazy(() => import('@/pages/AskAi'))
// import AiReports from "@/pages/AiReports";

const protect = (element: JSX.Element, allowedRoles = ["admin"]) => (
  <PrivateRoute allowedRoles={allowedRoles}>{element}</PrivateRoute>
);

export const routesConfig = [
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/home", element: protect(<Home />, ["admin", "user"]) },
  { path: "/signUp", element: <SignUp /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/Products", element: protect(<Products />, ["admin", "user"])},
  { path: "/suppliers", element:  protect(<Suppliers />) },
  { path: "/customers", element:  protect(<Customers />) },
  { path: "/dashboard", element: protect(<Dashboard />, ["admin", "user"]) },
  { path: "/sellProduct", element: protect(<SellProduct />) },
  { path: "/financialStatement", element: protect(<FinancialStatement />) },
  { path: "/SupplierDetails", element: protect(<SupplierDetails />) },
  { path: "/CustomerDetails", element: protect(<CustomerDetails />) },
  { path: "/productDetails", element: protect(<ProductDetails />, ["admin", "user"]) },
  { path: "/sellDetails", element: protect(<SellDetails />) },
  { path: "/Exchange", element: protect(<Exchange />) },
  { path: "/warehouses", element: protect(<Warehouses />) },
  { path: "/warehouses/:id", element: protect(<WarehousesDetails />) },
  { path: "/categories", element: protect(<Categories />) },
  { path: "/categories/:id", element: protect(<CategoryDetails />) },
  { path: "/accounts", element: protect(<ChartAccount />) },
  {path : '/accounts/:id' , element: protect(<ChartAccountDetails />)},
  { path: "/journal-entries", element: protect(<JournalEntries />) },
  { path: "/trial-balance", element: protect(<TrialBalance />) },
  { path: "/general-ledger", element: protect(<GeneralLedger />) },
  { path: "/general-ledger/:id", element: protect(<GeneralLedger />) },
  { path: "/income-statement", element: protect(<IncomeStatement />) },
  { path: "/profit-analysis", element: protect(<ProfitAnalysis />) },
  { path: "/inventory-balances", element: protect(<InventoryBalances />) },
  // { path: "/ai-reports", element: <AiReports /> },
  // { path: "/ai-chat", element: <AskAi /> },
  {path: '/purchases' , element: protect(<Purchases />)},
  { path: "*", element: <NotFound /> }
];
