import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export const CreditBalance = () => {
  const { user } = useAuth();
  const [carryover, setCarryover] = useState<number>(0); // optional if using
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Static Monthly Credits
  const monthlyCredits = 110;

  const fetchCreditDetails = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

      // Query monthly usage from global `credit_history` collection
      const creditHistoryRef = collection(db, "credit_history");
      const creditQuery = query(
        creditHistoryRef,
        where("userId", "==", user.uid),
        where("date", ">=", Timestamp.fromDate(startOfMonth)),
        where("date", "<", Timestamp.fromDate(startOfNextMonth)),
        where("type", "==", "used")
      );

      const snapshot = await getDocs(creditQuery);
      let totalUsed = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalUsed += Math.abs(data.amount); // ensure positive
      });

      setUsedCredits(totalUsed);

      // Optional: if you want carryover later, fetch from user doc
      setCarryover(0);
    } catch (err) {
      console.error("Error fetching credit details:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCreditDetails();
  }, [user]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading credit balance...
      </div>
    );
  }

  const totalAvailable = monthlyCredits + carryover;
  const creditsRemaining = totalAvailable - usedCredits;
  const usagePercentage =
    totalAvailable === 0 ? 0 : (usedCredits / totalAvailable) * 100;

  return (
    <Card className="col-span-full md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Credit Balance</CardTitle>
        <CardDescription>Your available design credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {creditsRemaining}
          </div>
          <div className="text-sm text-muted-foreground">credits remaining</div>
        </div>
        <Progress value={100 - usagePercentage} className="h-2" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Monthly credits:</span>
            <span>{monthlyCredits}</span>
          </div>
          <div className="flex justify-between">
            <span>Carryover credits:</span>
            <Badge variant="secondary" className="text-xs">
              +{carryover}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Used this month:</span>
            <span>{usedCredits}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total available:</span>
            <span>{totalAvailable}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
