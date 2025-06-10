
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

interface KanbanBoardProps {
  projects: Project[];
  onUpdateProject: (projectId: string, status: Project['status']) => void;
  onAddComment: (projectId: string, comment: string) => void;
}

const statusColumns = [
  { id: 'new' as const, title: 'New', color: 'bg-blue-50 border-blue-200' },
  { id: 'info_required' as const, title: 'Info Required', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'wip' as const, title: 'WIP', color: 'bg-orange-50 border-orange-200' },
  { id: 'feedback_approval' as const, title: 'Feedback & Approval', color: 'bg-purple-50 border-purple-200' },
  { id: 'completed' as const, title: 'Completed', color: 'bg-green-50 border-green-200' },
  { id: 'on_hold' as const, title: 'On Hold', color: 'bg-gray-50 border-gray-200' },
];

export const KanbanBoard = ({ projects, onUpdateProject, onAddComment }: KanbanBoardProps) => {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Project['status']) => {
    e.preventDefault();
    if (draggedProject) {
      onUpdateProject(draggedProject, status);
      setDraggedProject(null);
    }
  };

  const getProjectsByStatus = (status: Project['status']) => {
    return projects.filter(project => project.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-full">
      {statusColumns.map((column) => (
        <div
          key={column.id}
          className={`rounded-lg border-2 border-dashed p-4 min-h-96 ${column.color}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">{column.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {getProjectsByStatus(column.id).length}
            </Badge>
          </div>
          <div className="space-y-3">
            {getProjectsByStatus(column.id).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onAddComment={onAddComment}
                isDragging={draggedProject === project.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
