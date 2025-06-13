import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Comment, Project } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export const CommentHistory = () => {
  const { user } = useAuth();
  const [commentsData, setCommentsData] = useState<
    { projectId: string; comment: Comment }[]
  >([]);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState({
    fetching: false,
    replying: false,
  });

  useEffect(() => {
    const fetchComments = async () => {
      if (!user?.uid) return;
      setLoading((prev) => ({ ...prev, fetching: true }));
      try {
        const snap = await getDocs(
          collection(db, "users", user.uid, "projects")
        );
        const temp: typeof commentsData = [];
        snap.forEach((docSnap) => {
          const project = docSnap.data() as Project;
          // Fix: Use docSnap.id if project.id is undefined
          const projectId = project.id || docSnap.id;
          (project.designerComments || []).forEach((cmt) => {
            temp.push({ projectId, comment: cmt });
          });
        });
        temp.sort(
          (a, b) =>
            new Date(b.comment.timestamp).getTime() -
            new Date(a.comment.timestamp).getTime()
        );
        setCommentsData(temp);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading((prev) => ({ ...prev, fetching: false }));
      }
    };
    fetchComments();
  }, [user?.uid]);

  const handleReply = async (projectId: string, commentId: string) => {
    // Add validation to ensure required parameters exist
    if (!user?.uid || !projectId || !commentId) {
      console.error("Missing required parameters:", {
        userId: user?.uid,
        projectId,
        commentId,
      });
      return;
    }

    const replyContent = replyMap[commentId];
    if (!replyContent?.trim()) return;

    setLoading((prev) => ({ ...prev, replying: true }));
    try {
      const newReply: Comment = {
        id: `reply-${Date.now()}`,
        authorId: user.uid,
        authorName: user.displayName || "Client",
        content: replyContent.trim(),
        timestamp: new Date().toISOString(),
      };

      // Get the current project document
      const projectRef = doc(db, "users", user.uid, "projects", projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        throw new Error("Project not found");
      }

      const projectData = projectSnap.data() as Project;

      // Find and update the specific comment
      const updatedComments = (projectData.designerComments || []).map(
        (comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        }
      );

      // Update the project in Firestore
      await updateDoc(projectRef, {
        designerComments: updatedComments,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setCommentsData((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                comment:
                  updatedComments.find((c) => c.id === item.comment.id) ||
                  item.comment,
              }
            : item
        )
      );

      // Clear the reply input
      setReplyMap((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.error("Error posting reply:", error);
      // Add user-friendly error handling
      alert("Failed to post reply. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, replying: false }));
    }
  };

  if (loading.fetching && commentsData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">Loading comments...</div>
    );
  }

  if (commentsData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No comments found</div>
    );
  }

  return (
    <div className="space-y-4">
      {commentsData.map(({ projectId, comment }) => (
        <div
          key={`${projectId}-${comment.id}`}
          className="border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-gray-800">{comment.authorName}</p>
            <span className="text-gray-500">•</span>
            <p className="text-sm text-gray-500">
              {new Date(comment.timestamp).toLocaleString()}
            </p>
          </div>
          <p className="text-gray-700 mb-3">{comment.content}</p>

          {/* Display existing replies */}
          {comment.replies?.map((rep) => (
            <div
              key={rep.id}
              className="ml-6 p-3 bg-gray-50 rounded-lg border border-gray-100 my-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-800 text-sm">
                  {rep.authorName}
                </p>
                <span className="text-gray-500">•</span>
                <p className="text-xs text-gray-500">
                  {new Date(rep.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-gray-700 text-sm">{rep.content}</p>
            </div>
          ))}

          {/* Reply form */}
          <div className="mt-3 flex gap-2">
            <input
              value={replyMap[comment.id] || ""}
              onChange={(e) =>
                setReplyMap((s) => ({ ...s, [comment.id]: e.target.value }))
              }
              placeholder="Write a reply..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading.replying}
            />
            <button
              onClick={() => handleReply(projectId, comment.id)}
              className="px-4 bg-black text-white rounded-md hover:bg-black-700 disabled:bg-gray-400 text-sm py-2"
              disabled={loading.replying || !replyMap[comment.id]?.trim()}
            >
              {loading.replying ? "Sending..." : "Reply"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
