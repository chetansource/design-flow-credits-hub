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
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface DesignItem {
  id: string;
  name: string;
  sizes: string[];
  creditsPerCreative: number;
  category: string;
  description?: string;
}

export const DesignItemsTable = () => {
  const [items, setItems] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesignItems = async () => {
      const snapshot = await getDocs(collection(db, "designItems"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DesignItem[];
      setItems(list);
      setLoading(false);
    };

    fetchDesignItems();
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading design services...</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Design Item</TableHead>
            <TableHead>Size/Duration</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.sizes.join(", ")}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {item.creditsPerCreative} credits
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{item.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
