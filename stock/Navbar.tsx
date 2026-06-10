import { Link } from "@tanstack/react-router";
import logo from "@/assets/zones-logo.png.asset.json";
import { useAuth, signInWithGoogle, signOut, userAvatar, userDisplayName } from "@/lib/auth";
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
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-md">
          <img src={logo.url} alt="Zones" className="h-7 w-auto" />
        </Link>

        <div className="hidden text-sm font-semibold tracking-tight text-foreground sm:block">
          Zones Dinner Menu
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-ring rounded-full ring-offset-background transition hover:opacity-90">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={userAvatar(user)} alt={userDisplayName(user)} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {userDisplayName(user).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{userDisplayName(user)}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => signInWithGoogle()}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
