import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export interface inventoryUser {
  id: string,
  password: string,
  role: string,
  username: string,
}

export function Header() {
  const navigate = useNavigate()
  const [inventoryUser, setInventoryUser] = useState<inventoryUser>()

  useEffect(()=>{
    const temUser = JSON.parse(localStorage.getItem("InventoryUser") || "null");
    setInventoryUser(temUser)
  },[])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 md:flex">
          <div className="mr-6 flex items-center space-x-2">
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Daher-Net
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                / {inventoryUser?.username}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            {/*<ThemeToggle />*/}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt="@user" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {inventoryUser?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("InventoryUser");
                    navigate("/login");
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
