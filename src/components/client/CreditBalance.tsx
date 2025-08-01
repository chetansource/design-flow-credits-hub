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
  updateDoc,
} from "firebase/firestore";
interface CreditBalanceProps {
  onCreditsUpdate: (credits: number) => void;
}

export const CreditBalance = ({ onCreditsUpdate }: CreditBalanceProps) => {
  const { user } = useAuth();
  const [carryover, setCarryover] = useState<number>(0);
  const [monthlyCredits, setMonthlyCredits] = useState<number>(110);
  const [approvedCredits, setApprovedCredits] = useState<number>(0);
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  let creditsRemaining = 0;
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

      const sharedCreditDocRef = doc(db, "creditHistoryValue", "sharedClient");
      const sharedCreditSnap = await getDoc(sharedCreditDocRef);

      if (sharedCreditSnap.exists()) {
        const sharedData = sharedCreditSnap.data();
        const sharedCarryover = Number(sharedData?.carryover || 0);
        const dateUpdated = sharedData?.dateUpdated?.toDate?.();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastUpdatedMonth = dateUpdated?.getMonth?.();
        const lastUpdatedYear = dateUpdated?.getFullYear?.();

        console.log("▶️ Carryover Check Log:");
        console.log("Current Month:", currentMonth + 1, "Year:", currentYear);
        console.log(
          "Last Updated Month:",
          lastUpdatedMonth + 1,
          "Year:",
          lastUpdatedYear
        );

        if (
          lastUpdatedMonth !== currentMonth ||
          lastUpdatedYear !== currentYear
        ) {
          console.log("➡️ New month detected. Updating carryover...");

          const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
          const thisMonthStart = new Date(currentYear, currentMonth, 1);

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

          const unusedCredits = user.credits;
          console.log("unusedcredits", unusedCredits);
          console.log("userMonthlycredits", userMonthlyCredits);
          console.log("user.credits", user.credits);
          console.log("sharedcarryover", sharedCarryover);
          const newCarryover = unusedCredits;

          console.log("🔢 Last Month Used:", lastMonthUsed);
          console.log("🆕 New Carryover:", newCarryover);

          if (
            dateUpdated &&
            dateUpdated.getMonth() !== now.getMonth()
            // &&
            // dateUpdated.getFullYear() !== now.getFullYear()
          ) {
            await updateDoc(sharedCreditDocRef, {
              carryover: newCarryover,
              dateUpdated: Timestamp.fromDate(
                new Date(currentYear, currentMonth, 1) // 👈 set to *first day of this month*
              ),
            });
          }
          setCarryover(newCarryover);
        } else {
          console.log("✅ Carryover already updated this month.");
          setCarryover(sharedCarryover);
        }
      }

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

  useEffect(() => {
    if (!loading) {
      const totalAvailable = monthlyCredits + carryover + approvedCredits;
      const remaining = Math.max(0, totalAvailable - usedCredits);
      onCreditsUpdate(remaining); // 💡 Notify parent
    }
  }, [monthlyCredits, carryover, approvedCredits, usedCredits, loading]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading credit balance...
      </div>
    );
  }

  const totalAvailable = monthlyCredits + carryover + approvedCredits;
  creditsRemaining =
    totalAvailable > usedCredits
      ? Math.max(0, totalAvailable - usedCredits)
      : totalAvailable < usedCredits
      ? 110 - totalAvailable
      : totalAvailable - 110;
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
