import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  // const [showUploadDialog, setShowUploadDialog] = useState(false);
  // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const [uploading, setUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(project.id, newComment.trim());
      setNewComment("");
      setShowCommentForm(false);
    }
  };

  // const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const files = Array.from(e.target.files);
  //     setSelectedFiles(prev => [...prev, ...files]);
  //   }
  // };

  // const removeFile = (index: number) => {
  //   setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  // };

  // const extractFolderIdFromDriveLink = (driveLink: string): string | null => {
  //   // Extract folder ID from various OneDrive URL formats
  //   const patterns = [
  //     /folders\/([a-zA-Z0-9!_-]+)/,
  //     /id=([a-zA-Z0-9!_-]+)/,
  //     /resid=([a-zA-Z0-9!_-]+)/,
  //     /\/([a-zA-Z0-9!_-]{25,})/
  //   ];
    
  //   for (const pattern of patterns) {
  //     const match = driveLink.match(pattern);
  //     if (match) return match[1];
  //   }
  //   return null;
  // };

  // const uploadToOneDrive = async (file: File, folderId: string, accessToken: string): Promise<boolean> => {
  //   try {
  //     // Create upload session for large files (>4MB) or direct upload for smaller files
  //     const fileName = encodeURIComponent(file.name);
      
  //     if (file.size > 4 * 1024 * 1024) {
  //       // Large file upload using upload session
  //       const sessionResponse = await fetch(
  //         `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${fileName}:/createUploadSession`,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Authorization': `Bearer ${accessToken}`,
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             item: {
  //               "@microsoft.graph.conflictBehavior": "rename",
  //               name: file.name
  //             }
  //           })
  //         }
  //       );

  //       if (!sessionResponse.ok) {
  //         throw new Error('Failed to create upload session');
  //       }

  //       const sessionData = await sessionResponse.json();
  //       const uploadUrl = sessionData.uploadUrl;

  //       // Upload file in chunks
  //       const chunkSize = 320 * 1024; // 320KB chunks
  //       let start = 0;

  //       while (start < file.size) {
  //         const end = Math.min(start + chunkSize, file.size);
  //         const chunk = file.slice(start, end);

  //         const uploadResponse = await fetch(uploadUrl, {
  //           method: 'PUT',
  //           headers: {
  //             'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
  //             'Content-Length': chunk.size.toString(),
  //           },
  //           body: chunk
  //         });

  //         if (!uploadResponse.ok && uploadResponse.status !== 202) {
  //           throw new Error('Chunk upload failed');
  //         }

  //         // Update progress
  //         const progress = Math.round((end / file.size) * 100);
  //         setUploadProgress(prev => ({ ...prev, [file.name]: progress }));

  //         start = end;
  //       }
  //     } else {
  //       // Small file direct upload
  //       const uploadResponse = await fetch(
  //         `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${fileName}:/content`,
  //         {
  //           method: 'PUT',
  //           headers: {
  //             'Authorization': `Bearer ${accessToken}`,
  //             'Content-Type': 'application/octet-stream',
  //           },
  //           body: file
  //         }
  //       );

  //       if (!uploadResponse.ok) {
  //         throw new Error('File upload failed');
  //       }

  //       setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     return false;
  //   }
  // };

  // const handleUpload = async () => {
  //   if (!selectedFiles.length || !project.driveLink) return;

  //   setUploading(true);
  //   setUploadProgress({});

  //   try {
  //     // Extract folder ID from drive link
  //     const folderId = extractFolderIdFromDriveLink(project.driveLink); // give your drive link here
  //     if (!folderId) {
  //       throw new Error('Could not extract folder ID from drive link');
  //     }

  //     // Get access token (you'll need to implement OAuth flow)
  //     const accessToken = await getOneDriveAccessToken();
  //     if (!accessToken) {
  //       throw new Error('No access token available. Please sign in to OneDrive.');
  //     }

  //     // Upload each file
  //     const uploadPromises = selectedFiles.map(file => uploadToOneDrive(file, folderId, accessToken));
  //     const results = await Promise.all(uploadPromises);

  //     const successCount = results.filter(Boolean).length;
  //     const failCount = results.length - successCount;

  //     if (successCount > 0) {
  //       alert(`Successfully uploaded ${successCount} file(s)${failCount > 0 ? `. ${failCount} file(s) failed.` : '.'}`);
  //     } else {
  //       alert('All uploads failed. Please try again.');
  //     }

  //     // Reset form
  //     setSelectedFiles([]);
  //     setShowUploadDialog(false);
  //     setUploadProgress({});

  //   } catch (error) {
  //     console.error('Upload process failed:', error);
  //     alert(`Upload failed: ${error.message}`);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // This function needs to be implemented based on your OAuth setup
  // const getOneDriveAccessToken = async (): Promise<string | null> => {
  //   // Implementation depends on your authentication setup
  //   // You might store the token in localStorage, context, or fetch it from your backend
    
  //   // Example implementation:
  //   const token = localStorage.getItem('onedrive_access_token');
  //   if (!token) {
  //     // Trigger OAuth flow
  //     initiateOneDriveAuth();
  //     return null;
  //   }
  //   return token;
  // };

  // const initiateOneDriveAuth = () => {
  //   // Implement OneDrive OAuth flow
  //   const clientId = 'YOUR_ONEDRIVE_CLIENT_ID'; // Replace with your actual client ID
  //   const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
  //   const scopes = encodeURIComponent('files.readwrite.all');
    
  //   const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&response_mode=query`;
    
  //   window.open(authUrl, 'onedrive-auth', 'width=600,height=600');
  // };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      {/* Dropdown Details */}
      {showDetails && (
        <CardContent className="space-y-3 pt-2">
          {/* Add Comment */}
          {/* <div className="space-y-2">
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
          </div> */}
        </CardContent>
      )}
    </Card>
  );
};