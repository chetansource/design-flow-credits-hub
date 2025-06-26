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
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  collectionGroup,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  projectName: string;
  status: string;
  submittedDate: string;
  credits: number;
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
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      );
    case "wip":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          In Progress
        </Badge>
      );
    case "info_required":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Info Required
        </Badge>
      );
    case "new":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          New
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ProjectHistory = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessages, setNewMessages] = useState<Record<string, string>>({});
  const [messageListeners, setMessageListeners] = useState<
    Record<string, () => void>
  >({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collectionGroup(db, "projects"),
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

    return () => {
      unsubscribe();
      Object.values(messageListeners).forEach((unsub) => unsub());
    };
  }, [user]);

  const toggleExpand = async (projectId: string) => {
    if (expanded === projectId) {
      setExpanded(null);
      // Clean up the message listener for this project
      if (messageListeners[projectId]) {
        messageListeners[projectId]();
        const newListeners = { ...messageListeners };
        delete newListeners[projectId];
        setMessageListeners(newListeners);
      }
    } else {
      setExpanded(projectId);
      await fetchMessages(projectId);
    }
  };

  const fetchMessages = async (projectId: string) => {
    if (!user) return;

    if (messageListeners[projectId]) {
      messageListeners[projectId]();
    }

    // Use the same global messages collection that the designer uses
    const q = query(
      collection(db, "messages"),
      where("projectId", "==", projectId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            sender: data.sender,
            senderName:
              data.senderName ||
              (data.sender === "client" ? "You" : "Designer"),
            timestamp: data.timestamp,
            projectId: data.projectId,
          };
        });

        setMessages((prev) => ({
          ...prev,
          [projectId]: msgs,
        }));
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    setMessageListeners((prev) => ({
      ...prev,
      [projectId]: unsubscribe,
    }));
  };

  const handleAddComment = async (projectId: string) => {
    const message = newMessages[projectId]?.trim();
    if (!message || !user) return;

    const tempId = `temp-${Date.now()}`;

    try {
      // Clear input immediately
      setNewMessages((prev) => ({ ...prev, [projectId]: "" }));

      // Add optimistic update
      setMessages((prev) => ({
        ...prev,
        [projectId]: [
          ...(prev[projectId] || []),
          {
            id: tempId,
            text: message,
            sender: "client",
            senderName: "You",
            timestamp: null,
            projectId,
          },
        ],
      }));

      // Send to the same global messages collection that designer uses
      await addDoc(collection(db, "messages"), {
        projectId,
        sender: "client",
        senderName: "Client", // This will be displayed to the designer
        text: message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert optimistic update
      setMessages((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter((msg) => msg.id !== tempId),
      }));
      // Restore the message in input
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
            <>
              <TableRow
                key={project.id}
                onClick={() => toggleExpand(project.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">
                  {project.projectName}
                </TableCell>
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
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          (messages[project.id] || []).map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.sender === "client"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`w-fit max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                                  msg.sender === "client"
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-gray-200 text-gray-900"
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>
                                    {msg.sender === "client"
                                      ? "You"
                                      : "Designer"}
                                  </span>
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
                          className="flex-1"
                          value={newMessages[project.id] || ""}
                          onChange={(e) =>
                            setNewMessages((prev) => ({
                              ...prev,
                              [project.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) => handleKeyPress(e, project.id)}
                        />
                        <Button
                          className="bg-black text-white hover:bg-gray-800"
                          onClick={() => handleAddComment(project.id)}
                          disabled={!newMessages[project.id]?.trim()}
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
