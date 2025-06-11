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

export const DesignerLogin = () => {
  const { user, loading, signInAsDesigner, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "designer") {
        navigate("/designer-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    }
  }, [user, loading, navigate]);

  const handleDesignerLogin = async () => {
    if (user) {
      // If already logged in, sign out first
      await signOut();
    }
    await signInAsDesigner();
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
          <CardTitle className="text-2xl font-bold">Designer Portal</CardTitle>
          <CardDescription>
            Sign in to manage client projects with Kanban workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleDesignerLogin} className="w-full" size="lg">
            Sign in with Google as Designer
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Are you a client?
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/client-login")}
              className="text-sm"
            >
              Client Login →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
