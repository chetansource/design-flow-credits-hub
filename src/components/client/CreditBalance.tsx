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
  orderBy,
} from "firebase/firestore";

export const CreditBalance = () => {
  const { user } = useAuth();
  const [carryover, setCarryover] = useState<number>(0); // optional if using
  const [approvedCredits, setApprovedCredits] = useState<number>(0);
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Static Monthly Credits
  const monthlyCredits = 110;

  const fetchCreditDetails = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Query used credits from creditHistory
      const creditRef = collection(db, "users", user.uid, "creditHistory");
      const usedQuery = query(
        creditRef,
        where("date", ">=", Timestamp.fromDate(thisMonthStart)),
        where("date", "<", Timestamp.fromDate(nextMonthStart)),
        where("type", "==", "used")
      );
      const prevQuery = query(
        creditRef,
        where("date", ">=", Timestamp.fromDate(lastMonthStart)),
        where("date", "<", Timestamp.fromDate(thisMonthStart)),
        orderBy("date")
      );

      const [usedSnap, prevSnap] = await Promise.all([
        getDocs(usedQuery),
        getDocs(prevQuery),
      ]);

      let usedThisMonth = 0;
      usedSnap.forEach((doc) => {
        const d = doc.data();
        usedThisMonth += Math.abs(d.amount);
      });

      let carryover = 0;
      if (!prevSnap.empty) {
        const docs = prevSnap.docs;
        const lastDoc = docs[docs.length - 1];
        const lastData = lastDoc.data();
        carryover = lastData.balance || 0;
      }

      // ✅ Fetch approved extra credits from creditsbuyed
      const creditsBuyedRef = collection(db, "users", user.uid, "creditsbuyed");
      console.log("Fetching approved credits from:", creditsBuyedRef);
      const approvedQuery = query(
        creditsBuyedRef,
        where("status", "==", "approved")
      );
      const approvedSnap = await getDocs(approvedQuery);

      let extraApprovedCredits = 0;
      approvedSnap.forEach((doc) => {
        const data = doc.data();
        extraApprovedCredits += Number(data.buyedcredits || 0);
      });

      // Save states
      setUsedCredits(usedThisMonth);
      setApprovedCredits(extraApprovedCredits);
      console.log(extraApprovedCredits);
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

  const totalAvailable = monthlyCredits + carryover + approvedCredits;
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
          <div className="flex justify-between">
            <span>Credits bought:</span>
            <span>{approvedCredits}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total available:</span>
            <span>{creditsRemaining}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
