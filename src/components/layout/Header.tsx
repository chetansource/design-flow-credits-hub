import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/LD_logo.png"
            alt="Logo"
            className="w-[120px] object-contain rounded-md"
          />
          <h1 className="text-2xl font-bold text-foreground">Credit Tracker</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
