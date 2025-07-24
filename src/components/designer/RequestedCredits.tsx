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
    };

    fetchCredits();
  }, []);

  const approveCredits = async (path: string) => {
    const creditToApprove = creditRequests.find((c) => c.path === path);
    if (!creditToApprove) return;

    const { buyedcredits, username } = creditToApprove;

    try {
      // 1. Update the credit request document to approved
      await updateDoc(doc(db, path), { status: "approved" });

      // 2. Fetch all clients
      const clientsSnap = await getDocs(collection(db, "users"));
      const clientDocs = clientsSnap.docs.filter(
        (doc) => doc.data().role === "client"
      );

      if (clientDocs.length === 0) return;

      // 3. For each client, update credits
      // const updatePromises = clientDocs.map((clientDoc) => {
      //   const data = clientDoc.data();
      //   const newCredits = (data.credits || 0) + buyedcredits;

      //   return updateDoc(doc(db, "users", clientDoc.id), {
      //     credits: newCredits,
      //   });
      // });
      // 4. Optionally: Add to creditHistory for all clients
      // const creditHistoryPromises = clientDocs.map((clientDoc) =>
      //   addDoc(collection(db, "users", clientDoc.id, "creditHistory"), {
      //     type: "bought",
      //     amount: buyedcredits,
      //     description: `Admin approved credits requested by ${username}`,
      //     date: new Date(),
      //     balance: (clientDoc.data().credits || 0) + buyedcredits,
      //   })
      // );
      // await Promise.all([...updatePromises, ...creditHistoryPromises]);

      // 3. For each client, update credits and add credit history
      const updateAndLogPromises = clientDocs.map(async (clientDoc) => {
        const userRef = doc(db, "users", clientDoc.id);
        const currentCredits = clientDoc.data().credits || 0;
        const updatedCredits = currentCredits + buyedcredits;

        // ✅ Update user's credits
        await updateDoc(userRef, {
          credits: updatedCredits,
        });

        // ✅ Add to user's credit history
        await addDoc(collection(db, "users", clientDoc.id, "creditsbuyed"), {
          type: "bought",
          amount: buyedcredits,
          description: `Admin approved credits requested by ${username}`,
          date: new Date(),
          balance: updatedCredits,
        });
      });

      await Promise.all(updateAndLogPromises);

      // 5. Clean up UI state
      setCreditRequests((prev) => prev.filter((c) => c.path !== path));
      navigate("/designer");
    } catch (err) {
      console.error("Error approving credits:", err);
    }
  };

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
        {creditRequests.map((req) => (
          <div
            key={req.id}
            className="border p-4 rounded-md shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">{req.username}</p>
              <p className="text-sm text-gray-600">
                Requested {req.buyedcredits} credits
              </p>
            </div>
            <Button onClick={() => approveCredits(req.path)}>Approve</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
