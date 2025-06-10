
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, MessageSquare, ExternalLink } from 'lucide-react';
import { Project } from '@/types';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragEnd: () => void;
  onAddComment: (projectId: string, comment: string) => void;
  isDragging: boolean;
}

export const ProjectCard = ({ 
  project, 
  onDragStart, 
  onDragEnd, 
  onAddComment, 
  isDragging 
}: ProjectCardProps) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(project.id, newComment.trim());
      setNewComment('');
      setShowCommentForm(false);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'info_required': return 'bg-yellow-500';
      case 'wip': return 'bg-orange-500';
      case 'feedback_approval': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'on_hold': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragEnd={onDragEnd}
      className={`cursor-move transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {project.title}
          </CardTitle>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{project.clientName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Due: {format(new Date(project.dueDate), 'MMM dd')}</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium">{project.designItem.name}</p>
          <p className="text-xs text-muted-foreground">Size: {project.selectedSize}</p>
          <Badge variant="outline" className="text-xs">
            {project.creditsUsed} credits
          </Badge>
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {project.driveLink && (
          <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            <a href={project.driveLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              Drive Link
            </a>
          </Button>
        )}

        {project.designerComments.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              <span>{project.designerComments.length} comments</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Latest: {project.designerComments[project.designerComments.length - 1]?.content.slice(0, 50)}...
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!showCommentForm ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowCommentForm(true)}
            >
              Add Comment
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="Add your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-xs resize-none"
                rows={2}
              />
              <div className="flex gap-1">
                <Button size="sm" className="text-xs flex-1" onClick={handleAddComment}>
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
