
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const DesignerDashboard = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Designer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage client projects with Kanban-style workflow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Board</CardTitle>
          <CardDescription>
            Drag and drop projects through different stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Kanban board coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
