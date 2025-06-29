// Final enhanced ProjectRequestForm.tsx with button-triggered popup, dynamic design item list, and search functionality

"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  getDoc,
  getDocs,
} from "firebase/firestore";

interface DesignItem {
  id: string;
  name: string;
  creditsPerCreative: number;
  sizes: string[];
  category: string;
  description?: string;
}

interface ProjectRequestFormProps {
  onSuccess: () => void;
  refetchCredits: () => void;
}

export const ProjectRequestForm = ({
  onSuccess,
  refetchCredits,
}: ProjectRequestFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [designItems, setDesignItems] = useState<DesignItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DesignItem | null>(null);
  const [description, setDescription] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [timeLine, SetTimeLine] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "designItems"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DesignItem[];
      setDesignItems(items);
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedItem) return;

    setIsSubmitting(true);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const currentCredits = userData?.credits || 0;

    if (currentCredits < selectedItem.creditsPerCreative) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const totalCreditsNeeded = quantity * selectedItem.creditsPerCreative;

    const newCredits = currentCredits - totalCreditsNeeded;

    await addDoc(collection(db, "users", user.uid, "projects"), {
      name: selectedItem.name,
      description,
      driveLink,
      projectName,
      timeLine,
      quantity,
      credits: totalCreditsNeeded,
      creditsPerCreative: selectedItem.creditsPerCreative,
      submittedDate: serverTimestamp(),
      status: "new",
      clientId: user.uid,
      clientName: user.displayName || "Anonymous",
      clientEmail: user.email || "",
      comments: [], // Empty comments array for designer use
    });

    await updateDoc(userRef, { credits: newCredits });

    await addDoc(collection(db, "users", user.uid, "creditHistory"), {
      type: "used",
      amount: -totalCreditsNeeded,
      description: `Requested ${selectedItem.name}`,
      date: serverTimestamp(),
      balance: newCredits,
    });

    toast({ title: "Project submitted!" });
    setSelectedItem(null);
    setDescription("");
    setDriveLink("");
    setIsSubmitting(false);
    setProjectName("");
    SetTimeLine("");
    setQuantity(1);
    refetchCredits();
    onSuccess();
  };

  const filteredItems = designItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          type="text"
          placeholder="Enter Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Design Item</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              {selectedItem
                ? `${selectedItem.name} - ${selectedItem.creditsPerCreative} credits`
                : "Select Design Item"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select a Design Item</DialogTitle>
              <DialogDescription>
                Search and select a service from the full design list.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Search design services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="justify-start w-full text-left"
                  onClick={() => {
                    setSelectedItem(item);
                    setDialogOpen(false);
                  }}
                >
                  {item.name} - {item.creditsPerCreative} credits
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedItem && (
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter Quantity You Need"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      )}

      {selectedItem && (
        <>
          {/* <div className="space-y-2">
            <Label htmlFor="size">Size/Duration</Label>
            <select
              id="size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select size/duration</option>
              {selectedItem.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div> */}
          <div className="space-y-2">
            <Label
              htmlFor="timeline"
              className="text-sm font-medium text-gray-700"
            >
              Project Timeline
            </Label>
            <Input
              id="timeline"
              type="date"
              value={timeLine}
              onChange={(e) => SetTimeLine(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400"
            />
          </div>
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Credits:</strong> {selectedItem.creditsPerCreative}
              </p>
              <p>
                <strong>Category:</strong> {selectedItem.category}
              </p>
              {selectedItem.description && (
                <p>
                  <strong>Description:</strong> {selectedItem.description}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Project Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your project requirements..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="drive-link">Drive Link (Optional)</Label>
        <Input
          id="drive-link"
          type="url"
          placeholder="Paste Your drive Link Here..."
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Project Request"}
      </Button>
    </form>
  );
};
