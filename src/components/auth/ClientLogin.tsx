
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const ClientLogin = () => {
  const { signInAsClient } = useAuth();
  const navigate = useNavigate();

  const handleClientLogin = async () => {
    await signInAsClient();
    navigate('/client');
  };

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
          <Button
            onClick={handleClientLogin}
            className="w-full"
            size="lg"
          >
            Sign in as Client
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Are you a designer?
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/designer-login')}
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
