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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";
import { Project, Comment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DesignerProjectsChat } from "./DesignerMessages";

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Comment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSection, setActiveSection] = useState<"kanban" | "chat">(
    "kanban"
  );

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
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

      replies.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
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

  return (
    <div className="px-12 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mt-1">Dashboard</h1>
          <div className="flex gap-4 items-center">
            {["mail.lifedesigner@gmail.com","vignesh.dev.main@gmail.com"].includes(user?.email) && (
              <button
                onClick={() => navigate("/approve-credits")}
                className="text-sm px-4 py-1.5 rounded-md bg-black text-white hover:bg-gray-900 transition"
              >
                Approve Credits
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Total projects: {projects.length} | Active:{" "}
            {
              projects.filter(
                (p) => !["completed", "on_hold"].includes(p.status)
              ).length
            }{" "}
            | Completed:{" "}
            {projects.filter((p) => p.status === "completed").length}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Accordion Toggle Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSection("kanban")}
          className={`px-4 py-2 rounded-md font-medium transition ${
            activeSection === "kanban"
              ? "bg-black text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
        >
          Project Board
        </button>
        <button
          onClick={() => setActiveSection("chat")}
          className={`px-4 py-2 rounded-md font-medium transition ${
            activeSection === "chat"
              ? "bg-black text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
        >
          Project Chat
        </button>
      </div>

      {/* Accordion Content Section */}
      <div className="border rounded-xl p-4 shadow-md bg-white">
        {activeSection === "kanban" && (
          <KanbanBoard
            projects={projects}
            onUpdateProject={handleUpdateProject}
            onAddComment={handleAddComment}
          />
        )}

        {activeSection === "chat" && <DesignerProjectsChat />}
      </div>
    </div>
  );
};
