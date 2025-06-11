import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const ClientLogin = () => {
  const { user, loading, signInAsClient, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "client") {
        navigate("/client-dashboard");
      } else {
        navigate("/designer-dashboard");
      }
    }
  }, [user, loading, navigate]);

  const handleClientLogin = async () => {
    if (user) {
      // If already logged in, sign out first
      await signOut();
    }
    await signInAsClient();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Client Portal</CardTitle>
          <CardDescription>
            Sign in to manage your design projects and credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleClientLogin} className="w-full" size="lg">
            Sign in with Google as Client
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Are you a designer?
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/designer-login")}
              className="text-sm"
            >
              Designer Login →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
