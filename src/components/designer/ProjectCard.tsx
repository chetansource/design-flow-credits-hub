import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { Project } from "@/types";
import { format } from "date-fns";

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

  const parseCustomDate = (dateString) => {
    try {
      // Remove "at" and replace timezone format
      const cleanedDate = dateString
        .replace(" at ", " ")
        .replace("UTC+5:30", "+05:30");

      return new Date(cleanedDate);
    } catch (error) {
      return null;
    }
  };

  const formatDate = (dateValue: any) => {
    try {
      // Handle Firestore Timestamp
      if (dateValue?.toDate) {
        return dateValue.toDate().toLocaleDateString();
      }
      // Handle string/other formats
      const date = new Date(dateValue);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString()
        : "Invalid date";
    } catch (error) {
      return "Invalid date";
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
            <Badge className="text-xs">Credits: {project.credits}</Badge>
            {/* <p className="font-medium">
              <b>Client Name: </b> {project.clientName}
            </p> */}

            {/* Credits + Project Name */}
            <div className="flex flex-col items-start gap-2">
              <p>
                <b>Project Name:</b> {project.projectName}
              </p>
              <p className="font-medium">
                <b>Design Item:</b> {project.name}
              </p>
              <p className="font-medium">
                <b>Quantity:</b> {project.quantity}
              </p>
              <p className="font-medium">
                <b>Due Date:</b>{" "}
                {(() => {
                  try {
                    const date = new Date(project.timeLine);
                    return !isNaN(date.getTime())
                      ? date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : project.timeLine;
                  } catch (error) {
                    return project.timeLine;
                  }
                })()}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
            {/* Future Details — optional */}
            {/* <div className="text-xs text-muted-foreground">
              <strong>Size:</strong> {project.size}
            </div> */}

            {/* Drive Link and Upload Buttons */}
            <div className="flex gap-2 mt-2">
              {project.driveLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={project.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Drive
                  </a>
                </Button>
              )}
            </div>

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
    </Card>
  );
};
