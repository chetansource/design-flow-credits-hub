import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const DesignerLogin = () => {
  const { user, loading, signInAsDesigner, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isVerifiedDesigner, setIsVerifiedDesigner] = useState(false);
  const [error, setError] = useState("");

  // List of allowed designer emails
  const allowedDesigners = [
    "mail.lifedesigner@gmail.com",
    "account@lifedesigner.io",
    "grey@lifedesigner.io",
    "shilpa@lifedesigner.io",
    "alishapatra2001@gmail.com",
    "meenakshipriyeshwork@gmail.com"
  ];

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "designer") {
        navigate("/designer-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    }
  }, [user, loading, navigate]);

  const handleVerifyEmail = () => {
    if (allowedDesigners.includes(email.trim().toLowerCase())) {
      setIsVerifiedDesigner(true);
      setError("");
    } else {
      setError(
        "Unauthorized designer email. Please enter a valid designer email."
      );
      setIsVerifiedDesigner(false);
    }
  };

  const handleDesignerLogin = async () => {
    if (user) {
      await signOut(); // Sign out if already logged in
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
          <CardDescription>Sign in to manage client projects</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isVerifiedDesigner ? (
            <>
              <Input
                type="email"
                placeholder="Enter your designer email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleVerifyEmail} className="w-full" size="lg">
                Verify Email
              </Button>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handleDesignerLogin}
                className="w-full"
                size="lg"
              >
                Sign in with Google as Designer
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsVerifiedDesigner(false);
                  setEmail("");
                }}
                className="w-full text-sm text-muted-foreground"
              >
                Change Email
              </Button>
            </>
          )}

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
