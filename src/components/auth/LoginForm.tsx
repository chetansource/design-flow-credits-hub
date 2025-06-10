
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LoginForm = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Design Credits Hub</CardTitle>
          <CardDescription>
            Sign in to access your project management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="w-full"
            size="lg"
          >
            Sign in with Google
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Demo: Click above to sign in as a client
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
