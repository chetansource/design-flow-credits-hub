import { useEffect, useState } from "react";
import { collectionGroup, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
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
  const {user}= useAuth();

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
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const currentCredits = userData?.credits || 0;

    const newCredits = currentCredits + creditRequests.find(c => c.path === path)?.buyedcredits || 0;
    await updateDoc(doc(db, path), { status: "approved" });
    await updateDoc(userRef, { credits: newCredits });

    setCreditRequests((prev) => prev.filter((c) => c.path !== path));
    navigate("/designer");
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