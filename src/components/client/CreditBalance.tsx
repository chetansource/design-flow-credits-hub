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
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";

export const CreditBalance = () => {
  const { user } = useAuth();
  const [carryover, setCarryover] = useState<number>(0);
  const [monthlyCredits, setMonthlyCredits] = useState<number>(110);
  const [approvedCredits, setApprovedCredits] = useState<number>(0);
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCreditDetails = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const userMonthlyCredits = Number(userData?.monthlyCredits || 110);
      setMonthlyCredits(userMonthlyCredits);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // --- Used Credits This Month ---
      const creditRef = collection(db, "users", user.uid, "creditHistory");
      const usedQuery = query(
        creditRef,
        where("date", ">=", Timestamp.fromDate(thisMonthStart)),
        where("date", "<", Timestamp.fromDate(nextMonthStart)),
        where("type", "==", "used")
      );

      const usedSnap = await getDocs(usedQuery);
      let usedThisMonth = 0;
      usedSnap.forEach((doc) => {
        const d = doc.data();
        usedThisMonth += Math.abs(Number(d.amount || 0));
      });

      setUsedCredits(usedThisMonth);

      // --- Carryover from Last Month ---
      const prevQuery = query(
        creditRef,
        where("date", ">=", Timestamp.fromDate(lastMonthStart)),
        where("date", "<", Timestamp.fromDate(thisMonthStart)),
        orderBy("date")
      );

      const prevSnap = await getDocs(prevQuery);
      let lastMonthUsed = 0;
      prevSnap.forEach((doc) => {
        const d = doc.data();
        if (d.type === "used") {
          lastMonthUsed += Math.abs(Number(d.amount || 0));
        }
      });

      const unusedCredits = userMonthlyCredits - lastMonthUsed;
      const carryoverCredits = unusedCredits > 0 ? Math.min(unusedCredits, userMonthlyCredits) : 0;
      setCarryover(carryoverCredits);

      // --- Approved Credits Bought ---
      const creditsBuyedRef = collection(db, "users", user.uid, "creditsbuyed");
      const approvedQuery = query(
        creditsBuyedRef,
        where("status", "==", "approved")
      );
      const approvedSnap = await getDocs(approvedQuery);

      let extraApprovedCredits = 0;
      approvedSnap.forEach((doc) => {
        const data = doc.data();
        const parsed = parseFloat(data.buyedcredits);
        if (!isNaN(parsed)) {
          extraApprovedCredits += parsed;
        }
      });

      setApprovedCredits(extraApprovedCredits);
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
  const creditsRemaining = Math.max(0, totalAvailable - usedCredits);
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
