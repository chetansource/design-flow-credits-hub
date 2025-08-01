import { useEffect, useState } from "react";
import {
  collectionGroup,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface CreditRequest {
  id: string;
  userId: string;
  username: string;
  buyedcredits: number;
  status: "requested" | "approved";
  path: string;
}

export const RequestedCredits = () => {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      const snapshot = await getDocs(collectionGroup(db, "creditsbuyed"));
      const all = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CreditRequest, "id" | "path">),
          path: docSnap.ref.path,
        }))
        .filter((c) => c.status === "requested");

      setCreditRequests(all);

      // 👇 Fetch client count here
      const clientsSnap = await getDocs(collection(db, "users"));
      const clientDocs = clientsSnap.docs.filter(
        (doc) => doc.data().role === "client"
      );
      setTotalClients(clientDocs.length);
    };

    fetchCredits();
  }, []);

  const approveCredits = async (clickedPath: string) => {
    const creditToApprove = creditRequests.find((c) => c.path === clickedPath);
    if (!creditToApprove) return;

    const { buyedcredits, username } = creditToApprove;

    try {
      // ✅ Step 1: Get all requests with same username and status "requested"
      const snapshot = await getDocs(collectionGroup(db, "creditsbuyed"));
      const matchingRequests = snapshot.docs.filter((docSnap) => {
        const data = docSnap.data();
        return data.username === username && data.status === "requested";
      });

      // ✅ Step 2: Mark all matched credit requests as approved
      const approveAll = matchingRequests.map((docSnap) =>
        updateDoc(docSnap.ref, { status: "approved" })
      );
      await Promise.all(approveAll);

      // ✅ Step 3: Fetch all clients
      const clientsSnap = await getDocs(collection(db, "users"));
      const clientDocs = clientsSnap.docs.filter(
        (doc) => doc.data().role === "client"
      );

      if (clientDocs.length === 0) return;

      // ✅ Step 4: For each client, update credits and log in history
      const updateAndLogPromises = clientDocs.map(async (clientDoc) => {
        const userRef = doc(db, "users", clientDoc.id);
        const currentCredits = clientDoc.data().credits || 0;
        const updatedCredits = currentCredits + buyedcredits;

        await updateDoc(userRef, {
          credits: updatedCredits,
        });

        await addDoc(collection(db, "users", clientDoc.id, "creditsbuyed"), {
          type: "bought",
          amount: buyedcredits,
          description: `Admin approved credits requested by ${username}`,
          date: new Date(),
          balance: updatedCredits,
        });
      });

      await Promise.all(updateAndLogPromises);

      // ✅ Step 5: Remove all approved requests from UI
      setCreditRequests((prev) =>
        prev.filter((c) => c.username !== username || c.status !== "requested")
      );

      navigate("/designer");
    } catch (err) {
      console.error("Error approving credits:", err);
    }
  };

  const groupedRequests = Object.values(
    creditRequests.reduce((acc, req) => {
      if (!acc[req.username]) {
        acc[req.username] = { ...req, total: req.buyedcredits };
      } else {
        acc[req.username].total += req.buyedcredits;
      }
      return acc;
    }, {} as Record<string, CreditRequest & { total: number }>)
  );

  if (creditRequests.length === 0)
    return <p>There is no credits to approve :)</p>;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Requested Credits</CardTitle>
        <CardDescription>
          Review and approve client credit requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedRequests.map((req) => (
          <div
            key={req.username}
            className="border p-4 rounded-md shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">{req.username}</p>
              <p className="text-sm text-gray-600">
                Requested {req.total} credits —{" "}
                {totalClients > 0 ? Math.floor(req.total / totalClients) : 0}{" "}
                per client
              </p>
            </div>
            <Button onClick={() => approveCredits(req.path)}>Approve</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
