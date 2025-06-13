import { useEffect, useState, useRef } from "react";
import {
  collectionGroup,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";
import { Project, Comment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Comment[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collectionGroup(db, "projects"));
      const fetchedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(fetchedProjects);
    };

    const fetchReplies = async () => {
      const snapshot = await getDocs(collectionGroup(db, "projects"));
      const replies: Comment[] = [];

      snapshot.forEach((docSnap) => {
        const project = docSnap.data() as Project;
        (project.designerComments || []).forEach((cmt) => {
          (cmt.replies || []).forEach((reply) => {
            replies.push(reply);
          });
        });
      });

      replies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(replies);
      setUnreadCount(replies.length);
    };

    fetchProjects();
    fetchReplies();
  }, []);

  const handleUpdateProject = async (
    projectId: string,
    status: Project["status"]
  ) => {
    const updated = projects.map((project) =>
      project.id === projectId
        ? { ...project, status, updatedAt: new Date().toISOString() }
        : project
    );
    setProjects(updated);

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      await updateDoc(
        doc(db, `users/${project.clientId}/projects/${project.id}`),
        {
          status,
          updatedAt: serverTimestamp(),
        }
      );
    }

    toast({
      title: "Project Updated",
      description: `Project moved to ${status.replace("_", " ")} column`,
    });
  };

  const handleAddComment = async (projectId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: user?.uid,
      authorName: user?.displayName || "Designer",
      content,
      timestamp: new Date().toISOString(),
    };

    const updated = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            designerComments: [...(project.designerComments || []), newComment],
            updatedAt: new Date().toISOString(),
          }
        : project
    );
    setProjects(updated);

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      try {
        const projectRef = doc(
          db,
          `users/${project.clientId}/projects/${project.id}`
        );
        await updateDoc(projectRef, {
          designerComments: arrayUnion(newComment),
          updatedAt: serverTimestamp(),
        });

        toast({
          title: "Comment Added",
          description: "Your comment has been saved",
        });
      } catch (error) {
        console.error("Failed to add comment:", error);
        toast({
          title: "Error",
          description: "Failed to save the comment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      // When opening notifications, mark all as read
      setUnreadCount(0);
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="px-12 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mt-1">Dashboard</h1>
          
          {/* Notification Icon */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new replies
                    </div>
                  ) : (
                    notifications.map((reply) => (
                      <div key={reply.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {reply.authorName}
                          </p>
                          <span className="text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            {new Date(reply.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Total projects: {projects.length} | Active: {projects.filter((p) => !["completed", "on_hold"].includes(p.status)).length} | Completed: {projects.filter((p) => p.status === "completed").length}
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