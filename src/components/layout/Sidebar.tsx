import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingCart,
  Users2,
  FileText,
  BrainCircuit,
  ChartNoAxesCombined,
  Warehouse,
  UserPlus,
  Shapes,
  Book,
  BookOpen,
  ScrollText,
  Scale,
  TrendingUp,
  ClipboardList,
  LayoutDashboard,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigationGroups = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
    allowed: ["admin", "user"],
  },
  {
    name: "All Products",
    href: "/Products",
    icon: Package,
    allowed: ["admin" , 'user' ],
  },
  {
    name: "Inventory Balances",
    href: "/inventory-balances",
    icon: ClipboardList,
    allowed: ["admin"],
  },
  {
    name: "Purchases",
    href: "/purchases",
    icon: Truck,
    allowed: ["admin"],
  },
  {
    name: "Sell Product",
    href: "/sellProduct",
    icon: ShoppingCart,
    allowed: ["admin"],
  },
  {
    name: "Suppliers",
    href: "/Suppliers",
    icon: UserPlus,
    allowed: ["admin"],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users2,
    allowed: ["admin"],
  },
  {
    name: "Financial Statement",
    href: "/financialStatement",
    icon: FileText,
    allowed: ["admin"],
  },
  {
    name: "Warehouses",
    href: "/warehouses",
    icon: Warehouse,
    allowed: ["admin"],
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Shapes,
    allowed: ["admin"],
  },
  {
  name: "Chart of Accounts",
  href: "/accounts",
  icon: Book,
  allowed: ["admin"],
},
{
  name: "Journal Entries",
  href: "/journal-entries",
  icon: ScrollText,
  allowed: ["admin"],
},
{
  name: "Trial Balance",
  href: "/trial-balance",
  icon: Scale,
  allowed: ["admin"],
},
{
  name: "General Ledger",
  href: "/general-ledger",
  icon: BookOpen,
  allowed: ["admin"],
},
{
  name: "Income Statement",
  href: "/income-statement",
  icon: ChartNoAxesCombined,
  allowed: ["admin"],
},
{
  name: "Profit Analysis",
  href: "/profit-analysis",
  icon: TrendingUp,
  allowed: ["admin"],
},
// {
//   name: "AI Reports",
//   href: "/ai-reports",
//   icon: BrainCircuit,
//   allowed: ["admin"],
// },
// {
//   name: "Ask AI",
//   href: "/ai-chat",
//   icon: BrainCircuit,
//   allowed: ["admin"],
// }
  // {
  //   name: "Exchange",
  //   href: "/Exchange",
  //   icon: ArrowUpDown,
  //   allowed: ["admin"]
  // },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  className,
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const location = useLocation();
  const userStr = localStorage.getItem("InventoryUser");
  const user = userStr ? JSON.parse(userStr) : null;

  const isDashboardActive = location.pathname === "/dashboard";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-sidebar transition-all duration-300 ease-in-out shadow-md",
        isMobile ? "w-full border-r-0 shadow-none" : isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-accent">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <span className="bg-gradient-to-r font-extrabold from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Daher-Net
            </span>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-full text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Dashboard Link */}
      {["admin", "user"].includes(user?.role) && (
        <nav className="px-2 py-3">
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className={cn(
              "flex min-h-10 items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isDashboardActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0 mr-3" />
            {(!isCollapsed || isMobile) && "Dashboard"}
          </Link>
        </nav>
      )}

      {/* Other Navigation Groups */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {navigationGroups.map((group) => {
          const isActive = location.pathname === group.href;
          return (
            group.allowed.includes(user?.role) && (
              <Link
                key={group.name}
                to={group.href}
                onClick={onNavigate}
                className={cn(
                  "group flex mt-2 min-h-10 items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <group.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                {(!isCollapsed || isMobile) && group.name}
              </Link>
            )
          );
        })}
      </nav>
    </div>
  );
}
