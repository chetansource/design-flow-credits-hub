
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanBoard } from './KanbanBoard';
import { mockProjects } from '@/data/mockProjects';
import { Project, Comment } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const { toast } = useToast();

  const handleUpdateProject = (projectId: string, status: Project['status']) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              status, 
              updatedAt: new Date().toISOString() 
            }
          : project
      )
    );

    toast({
      title: "Project Updated",
      description: `Project moved to ${status.replace('_', ' ')} column`,
    });
  };

  const handleAddComment = (projectId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: 'demo-designer-1',
      authorName: 'Demo Designer',
      content,
      timestamp: new Date().toISOString(),
    };

    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              designerComments: [...project.designerComments, newComment],
              updatedAt: new Date().toISOString(),
            }
          : project
      )
    );

    toast({
      title: "Comment Added",
      description: "Your comment has been added to the project",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Designer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage client projects with Kanban-style workflow
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Total projects: {projects.length} | 
            Active: {projects.filter(p => !['completed', 'on_hold'].includes(p.status)).length} | 
            Completed: {projects.filter(p => p.status === 'completed').length}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="h-screen">
        <KanbanBoard
          projects={projects}
          onUpdateProject={handleUpdateProject}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
};
