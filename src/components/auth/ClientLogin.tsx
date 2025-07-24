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

export const ClientLogin = () => {
  const { user, loading, signInAsClient, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isVerifiedClient, setIsVerifiedClient] = useState(false);
  const [error, setError] = useState("");

  // List of allowed client emails
  const allowedClients = [
    "heygrey05@gmail.com",
    "desikan1984@gmail.com",
    "silky88sharan@gmail.com",
    "itsmeeio.ld.1@gmail.com",
    "petzjs@gmail.com",
    // Add more client emails as needed
  ];

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "client") {
        navigate("/client-dashboard");
      } else {
        navigate("/designer-dashboard");
      }
    }
  }, [user, loading, navigate]);

  const handleVerifyEmail = () => {
    if (allowedClients.includes(email.trim().toLowerCase())) {
      setIsVerifiedClient(true);
      setError("");
    } else {
      setError("Unauthorized client email. Please contact support.");
      setIsVerifiedClient(false);
    }
  };

  const handleClientLogin = async () => {
    if (user) {
      await signOut(); // Sign out if already logged in
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
          {!isVerifiedClient ? (
            <>
              <Input
                type="email"
                placeholder="Enter your client email"
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
              <Button onClick={handleClientLogin} className="w-full" size="lg">
                Sign in with Google as Client
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsVerifiedClient(false);
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
