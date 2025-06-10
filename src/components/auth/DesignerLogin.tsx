
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const DesignerLogin = () => {
  const { signInAsDesigner } = useAuth();
  const navigate = useNavigate();

  const handleDesignerLogin = async () => {
    await signInAsDesigner();
    navigate('/designer');
  };

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
          <Button
            onClick={handleDesignerLogin}
            className="w-full"
            size="lg"
          >
            Sign in as Designer
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Are you a client?
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/client-login')}
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
