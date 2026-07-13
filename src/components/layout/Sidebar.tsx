import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  dashboardNavigationItem,
  sidebarNavigationGroups,
  userCanAccessNavigation,
} from "@/config/permissions";

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
  const DashboardIcon = dashboardNavigationItem.icon;

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
      {userCanAccessNavigation(user, dashboardNavigationItem) && (
        <nav className="px-2 py-3">
          <Link
            to={dashboardNavigationItem.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-10 items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isDashboardActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
          >
            <DashboardIcon className="h-5 w-5 flex-shrink-0 mr-3" />
            {(!isCollapsed || isMobile) && dashboardNavigationItem.name}
          </Link>
        </nav>
      )}

      {/* Other Navigation Groups */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {sidebarNavigationGroups.map((group) => {
          const isActive = location.pathname === group.href;
          return (
            userCanAccessNavigation(user, group) && (
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
