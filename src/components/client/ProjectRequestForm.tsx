'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { designItems } from "@/data/designItems";
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
  setDoc,
} from "firebase/firestore";

interface ProjectRequestFormProps {
  onSuccess: () => void;
}

export const ProjectRequestForm = ({ onSuccess }: ProjectRequestFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [description, setDescription] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const design = designItems.find((item) => item.id === selectedItem);
    if (!design || !selectedSize) {
      toast({ title: "Invalid submission", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const currentCredits = userData?.credits || 0;

    if (currentCredits < design.creditsPerCreative) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const newCredits = currentCredits - design.creditsPerCreative;

    // 1. Add new project
    await addDoc(collection(db, "users", user.uid, "projects"), {
      name: design.name,
      size: selectedSize,
      description,
      driveLink,
      credits: design.creditsPerCreative,
      submittedDate: serverTimestamp(),
      status: "pending",
    });

    // 2. Update credits
    await updateDoc(userRef, { credits: newCredits });

    // 3. Log credit usage
    await addDoc(collection(db, "users", user.uid, "creditHistory"), {
      type: "used",
      amount: -design.creditsPerCreative,
      description: `Requested ${design.name}`,
      date: serverTimestamp(),
      balance: newCredits,
    });

    // Cleanup
    toast({ title: "Project submitted!" });
    setSelectedItem("");
    setSelectedSize("");
    setDescription("");
    setDriveLink("");
    setIsSubmitting(false);
    onSuccess();
  };

  const selectedDesignItem = designItems.find(
    (item) => item.id === selectedItem
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="design-item">Design Item</Label>
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger>
            <SelectValue placeholder="Select a design item" />
          </SelectTrigger>
          <SelectContent>
            {designItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} - {item.creditsPerCreative} credits
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDesignItem && (
        <>
          <div className="space-y-2">
            <Label htmlFor="size">Size/Duration</Label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size/duration" />
              </SelectTrigger>
              <SelectContent>
                {selectedDesignItem.sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Credits:</strong>{" "}
                  {selectedDesignItem.creditsPerCreative}
                </p>
                <p>
                  <strong>Category:</strong> {selectedDesignItem.category}
                </p>
                {selectedDesignItem.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedDesignItem.description}
                  </p>
                )}
              </div>
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
        <Label htmlFor="drive-link">Google Drive Link (Optional)</Label>
        <Input
          id="drive-link"
          type="url"
          placeholder="https://drive.google.com/..."
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
