import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Project } from "@/types";

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
  isDragging,
}: ProjectCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(project.id, newComment.trim());
      setNewComment("");
      setShowCommentForm(false);
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragEnd={onDragEnd}
      className={`w-full max-w-full overflow-hidden break-words cursor-move transition-all duration-200 hover:shadow-md ${
        isDragging ? "opacity-50 rotate-2" : ""
      }`}
    >
      {/* Collapsed Header */}
      <CardHeader
        className="cursor-pointer space-y-2"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1 text-sm">
            {/* Client Name */}
            <p className="text-muted-foreground">{project.clientName}</p>

            {/* Credits + Project Name */}
            <div className="flex flex-col items-start gap-2">
              <Badge className="text-xs">{project.credits} credits</Badge>
              <p className="font-medium">{project.name}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
            {/* Future Details — optional */}
            <div className="text-xs text-muted-foreground">
              <strong>Size:</strong> {project.size}
            </div>

            {/* Drive Link */}
            {project.driveLink && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs mt-1"
                asChild
              >
                <a
                  href={project.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Drive File
                </a>
              </Button>
            )}

            {/* Comment Preview */}
            {project.designerComments?.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                <MessageSquare className="w-3 h-3 inline-block mr-1" />
                {project.designerComments.length} comments | Latest:{" "}
                {project.designerComments.at(-1)?.content.slice(0, 50)}...
              </div>
            )}
          </div>

          {/* Chevron */}
          {showDetails ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {/* Dropdown Details */}
      {showDetails && (
        <CardContent className="space-y-3 pt-2">
          {/* Add Comment */}
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
                  <Button
                    size="sm"
                    className="text-xs flex-1"
                    onClick={handleAddComment}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setShowCommentForm(false);
                      setNewComment("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
