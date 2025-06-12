import { useEffect, useState } from "react";
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
import { KanbanBoard } from "./KanbanBoard";
import { Project, Comment } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  // Fetch all submitted projects from all users
  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collectionGroup(db, "projects"));
      const fetchedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(fetchedProjects);
    };

    fetchProjects();
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

    // Update in Firestore
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
      authorId: "demo-designer-1",
      authorName: "Demo Designer",
      content,
      timestamp: new Date().toISOString(),
    };

    const updated = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            designerComments: [...project.designerComments, newComment],
            updatedAt: new Date().toISOString(),
          }
        : project
    );
    setProjects(updated);

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      await updateDoc(
        doc(db, `users/${project.clientId}/projects/${project.id}`),
        {
          designerComments: arrayUnion(newComment),
          updatedAt: serverTimestamp(),
        }
      );
    }

    toast({
      title: "Comment Added",
      description: "Your comment has been saved",
    });
  };

  return (
    <div className="px-12 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 ">
        <img
          src="/LD_logo.png"
          alt="Logo"
          className="h-40 w-40 object-contain rounded-md"
        />
        <h1 className="text-3xl font-bold mt-1"> Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage client projects with Kanban-style workflow
        </p>
      </div>

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
