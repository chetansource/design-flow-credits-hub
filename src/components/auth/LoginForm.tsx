import React from "react";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";

interface LoginFormProps {
  onLogin: (role: "client" | "designer") => void;
  role: "client" | "designer";
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, role }) => {
  const { user, signInAsClient, signInAsDesigner, signOut } = useAuth();

  const handleLogin = async () => {
    if (user) {
      // If already logged in, sign out first
      await signOut();
    }
    if (role === "client") {
      await signInAsClient();
    } else {
      await signInAsDesigner();
    }
    onLogin(role); // Proceed to dashboard after login
  };

  return (
    <div className="space-y-4">
      {user ? (
        <Button onClick={signOut} variant="destructive">
          Sign Out
        </Button>
      ) : (
        <Button onClick={handleLogin}>
          Sign in with Google as {role.charAt(0).toUpperCase() + role.slice(1)}
        </Button>
      )}
    </div>
  );
};
