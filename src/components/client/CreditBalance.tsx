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
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export const CreditBalance = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [carryover, setCarryover] = useState<number>(0);
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setCredits(data.credits || 0);
        setCarryover(data.carryover || 0);
        setUsedCredits(data.usedCredits || 0); // optional
      }
      setLoading(false);
    };

    fetchCredits();
  }, [user]);

  if (loading || credits === null) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading credit balance...
      </div>
    );
  }

  const totalAvailable = credits + carryover;
  const usagePercentage = (usedCredits / totalAvailable) * 100;

  return (
    <Card className="col-span-full md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Credit Balance</CardTitle>
        <CardDescription>Your available design credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{credits}</div>
          <div className="text-sm text-muted-foreground">credits remaining</div>
        </div>
        <Progress value={100 - usagePercentage} className="h-2" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Monthly credits:</span>
            <span>{credits}</span>
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
            <span>{credits + carryover}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
