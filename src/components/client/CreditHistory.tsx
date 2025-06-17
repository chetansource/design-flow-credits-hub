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
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface CreditTransaction {
  id: string;
  type: "added" | "used";
  amount: number;
  description: string;
  date: string;
  balance: number;
}

export const CreditHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCreditHistory = async () => {
      const q = query(
        collection(db, "users", user.uid, "creditHistory"),
        orderBy("date")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date.seconds * 1000).toLocaleDateString(),
      })) as CreditTransaction[];
      setTransactions(data);
      setLoading(false);
    };

    fetchCreditHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading credit history...</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.date}</TableCell>
              <TableCell>
                <Badge
                  variant={tx.type === "added" ? "default" : "secondary"}
                  className={
                    tx.type === "added"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {tx.type === "added" ? "Credit Added" : "Credit Used"}
                </Badge>
              </TableCell>
              <TableCell
                className={tx.amount > 0 ? "text-green-600" : "text-red-600"}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}
              </TableCell>
              <TableCell>{tx.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
