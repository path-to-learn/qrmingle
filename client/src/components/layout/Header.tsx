import { Link } from "wouter";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User, BarChart2, Crown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.75 4.5C3.75 3.12 4.87 2 6.25 2h11.5c1.38 0 2.5 1.12 2.5 2.5v15c0 1.38-1.12 2.5-2.5 2.5H6.25C4.87 20 3.75 18.88 3.75 17.5v-15zM6.25 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h11.5c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5H6.25zM7.5 12.25h9M11.75 18a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              <span className="font-bold text-xl text-primary">ContactQrConnect</span>
            </a>
          </Link>
        </div>
        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 group">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-neutral-dark group-hover:text-primary transition-colors">
                    {user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <a className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profiles</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/analytics">
                    <a className="flex items-center cursor-pointer">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                {!user.isPremium && (
                  <DropdownMenuItem asChild>
                    <Link href="/premium">
                      <a className="flex items-center cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        <span>Upgrade to Premium</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" className="hover:text-primary hover:border-primary">
                Login
              </Button>
              <Button>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
