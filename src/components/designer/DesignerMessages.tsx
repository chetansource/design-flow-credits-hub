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
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Backpack,
  Move3D,
  MoveDiagonal,
  MoveDownLeft,
  SkipBack,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  projectName: string;
  status: string;
  submittedDate: string;
  credits: number;
  clientId: string;
  submittedTimestamp: number; // Add this for sorting
}

interface Message {
  id: string;
  text: string;
  sender: string; // 'client' or 'designer'
  senderName: string;
  timestamp: any;
  projectId: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "wip":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
    case "info_required":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Info Required</Badge>
      );
    case "new":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">New</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const DesignerProjectsChat = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessages, setNewMessages] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snapshot = await getDocs(collectionGroup(db, "projects"));
        const fetchedProjects = snapshot.docs.map((doc) => {
          const data = doc.data();
          const submittedTimestamp = data.submittedDate?.seconds
            ? data.submittedDate.seconds * 1000
            : 0;

          return {
            id: doc.id,
            name: data.name || "Unnamed Project",
            projectName: data.projectName || "Untitled Project",
            status: data.status || "new",
            submittedDate: submittedTimestamp
              ? new Date(submittedTimestamp).toLocaleDateString()
              : "Unknown date",
            credits: data.credits || 0,
            clientId: doc.ref.parent.parent?.id || "unknown",
            submittedTimestamp, // Store for sorting
          };
        });

        // Sort projects by submitted date (most recent first)
        const sortedProjects = fetchedProjects.sort((a, b) => {
          return b.submittedTimestamp - a.submittedTimestamp;
        });

        setProjects(sortedProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleExpand = async (projectId: string) => {
    if (expanded === projectId) {
      setExpanded(null);
    } else {
      setExpanded(projectId);
      fetchMessages(projectId);
    }
  };

  const fetchMessages = (projectId: string) => {
    const q = query(
      collection(db, "messages"),
      where("projectId", "==", projectId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            sender: data.sender,
            senderName:
              data.senderName || (data.sender === "client" ? "Client" : "You"),
            timestamp: data.timestamp,
            projectId: data.projectId,
          };
        });
        setMessages((prev) => ({ ...prev, [projectId]: msgs }));
      },
      (error) => {
        console.error("Message fetch error:", error);
      }
    );
  };

  const handleAddComment = async (projectId: string) => {
    const message = newMessages[projectId]?.trim();
    if (!message) return;

    const tempId = Date.now().toString();
    setNewMessages((prev) => ({ ...prev, [projectId]: "" }));
    setMessages((prev) => ({
      ...prev,
      [projectId]: [
        ...(prev[projectId] || []),
        {
          id: tempId,
          text: message,
          sender: "designer",
          senderName: "You",
          timestamp: null,
          projectId,
        },
      ],
    }));

    try {
      await addDoc(collection(db, "messages"), {
        projectId,
        sender: "designer",
        senderName: "Designer",
        text: message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter((msg) => msg.id !== tempId),
      }));
      setNewMessages((prev) => ({ ...prev, [projectId]: message }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment(projectId);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Sending...";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "";
  };

  if (loading)
    return <div className="text-muted-foreground p-4">Loading projects...</div>;
  if (projects.length === 0)
    return <div className="text-muted-foreground p-4">No projects found</div>;

  return (
    <div className="container mx-auto rounded-md border mt-12">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead>Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <>
              <TableRow
                key={project.id}
                onClick={() => toggleExpand(project.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{project.projectName}</TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell>{project.submittedDate}</TableCell>
                <TableCell>{project.credits} credits</TableCell>
              </TableRow>
              {expanded === project.id && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {(messages[project.id] || []).length === 0 ? (
                          <div className="text-gray-500 text-sm text-center py-4">
                            No messages yet
                          </div>
                        ) : (
                          (messages[project.id] || []).map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.sender === "designer"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`w-fit max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                                  msg.sender === "designer"
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-gray-200 text-gray-900"
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>{msg.senderName}</span>
                                  <span>{formatTimestamp(msg.timestamp)}</span>
                                </div>
                                <div className="text-sm">{msg.text}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Type your reply..."
                          value={newMessages[project.id] || ""}
                          onChange={(e) =>
                            setNewMessages((prev) => ({
                              ...prev,
                              [project.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) => handleKeyPress(e, project.id)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleAddComment(project.id)}
                          disabled={!newMessages[project.id]?.trim()}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
