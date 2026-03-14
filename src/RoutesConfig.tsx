import React from "react";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

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


export const routesConfig = [
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/signUp", element: <SignUp /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/Products", element: <Products />},
  { path: "/suppliers", element:  <Suppliers /> },
  { path: "/customers", element:  <Customers /> },
  { path: "/dashboard", element: <PrivateRoute allowedRoles={["admin"]}><Dashboard /></PrivateRoute> },
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
  { path: "*", element: <NotFound /> }
];
