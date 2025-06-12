import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

interface Project {
  id: string;
  name: string;
  status: string;
  submittedDate: string;
  credits: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case "feedback":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Feedback & Approval
        </Badge>
      );
    case "pending":
      return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ProjectHistory = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "projects"),
      orderBy("submittedDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedDate: new Date(
          doc.data().submittedDate.seconds * 1000
        ).toLocaleDateString(),
      })) as Project[];
      setProjects(data);
      setLoading(false);
    });

    return () => unsubscribe(); // ✅ Correct cleanup
  }, [user]);

  if (loading) {
    return <div className="text-muted-foreground">Loading projects...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead>Credits Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{getStatusBadge(project.status)}</TableCell>
              <TableCell>{project.submittedDate}</TableCell>
              <TableCell>{project.credits} credits</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
