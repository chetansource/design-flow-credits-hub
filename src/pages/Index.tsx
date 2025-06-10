
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'client') {
        navigate('/client');
      } else if (user.role === 'designer') {
        navigate('/designer');
      }
    }
  }, [user, navigate]);

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Design Credits Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Streamline your design projects with our credit-based management system. 
            Perfect collaboration between clients and designers.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>For Clients</span>
                </CardTitle>
                <CardDescription>
                  Manage your design projects with ease
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">110 credits per month with carryover</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Submit project requests easily</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Track project progress in real-time</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Review and approve deliverables</span>
                </div>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>For Designers</span>
                </CardTitle>
                <CardDescription>
                  Efficient project management workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Kanban-style project board</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Drag-and-drop status updates</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Client communication tools</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Timeline management</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Ready to get started? Sign in with your Google account.
            </p>
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
