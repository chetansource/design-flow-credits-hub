import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditBalance } from "./CreditBalance";
import { DesignItemsTable } from "./DesignItemsTable";
import { ProjectRequestForm } from "./ProjectRequestForm";
import { ProjectHistory } from "./ProjectHistory";
import { CreditHistory } from "./CreditHistory";
import { CommentHistory } from "../commentHistory/CommentHistory";
import { Link, Minus, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [credits, setCredits] = useState(10);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);


  const increment = () => setCredits((prev) => prev + 10);
  const decrement = () => setCredits((prev) => (prev > 10 ? prev - 10 : prev));

  // const handleSubmit = async () => {
  //   if (!user) return;

  //   try {
  //     await addDoc(collection(db, "users", user.uid, "creditsbuyed"), {
  //       userid: user.uid,
  //       buyedcredits: credits,
  //       status: "requested", // or "approved" based on your flow
  //       username: user.displayName || "Unknown",
  //       timestamp: new Date(),
  //     });

  //     alert("Credit request submitted!");
  //   } catch (error) {
  //     console.error("Error submitting credit request:", error);
  //     alert("Failed to submit request. Please try again.");
  //   }
  // };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const clientsSnap = await getDocs(collection(db, "users"));
      const clientDocs = clientsSnap.docs.filter(
        (doc) => doc.data().role === "client"
      );

      // For each client, add a requested credit entry
      const createRequests = clientDocs.map((clientDoc) =>
        addDoc(collection(db, "users", clientDoc.id, "creditsbuyed"), {
          userid: user.uid, // who initiated
          buyedcredits: credits,
          status: "requested",
          username: user.displayName || "Unknown",
          timestamp: new Date(),
        })
      );

      await Promise.all(createRequests);

      alert("Credit request submitted!");
    } catch (error) {
      console.error("Error submitting credit request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex space-x-3 items-center">
          <img
            src="/xrite-pantone-Logo.png"
            alt="Company Logo"
            className="h-12 w-12 object-contain rounded-md"
          />
          <h1 className="text-3xl font-bold mb-2">Xrite Pantone Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your design projects and track credit usage
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="new-project">New Project</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          {/* <TabsTrigger value="credits">Credit History</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CreditBalance onCreditsUpdate={setCreditsRemaining} />

            <div className="flex flex-col items-start gap-2">
              <button
                onClick={() =>
                  window.open(
                    "https://lifedesignerio-my.sharepoint.com/:f:/g/personal/projectcoordinator_lifedesigner_io/EhH-RNcz_E1En7-yZPi6NkcBYS9zcmmA-hCnvjg7iHypPA?e=JF93YJ",
                    "_blank"
                  )
                }
                className="text-sm px-3 py-1 bg-black text-white rounded-md flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                View Project Master Drive
              </button>
              <div className="mt-4 border border-black rounded-xl p-4 w-full max-w-xs shadow-sm">
                <span className="block text-sm font-semibold mb-2 text-gray-800 text-center">
                  Buy Credits
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={decrement}
                    className="p-2 border border-black rounded-md cursor-pointer disabled:opacity-50"
                    disabled={credits <= 10}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-lg font-bold text-gray-900">
                    {credits}
                  </span>

                  <button
                    onClick={increment}
                    className="p-2 border border-black cursor-pointer rounded-md "
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-black text-white py-2 mt-4 rounded-md hover:bg-gray-900 transition"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Available Design Services</CardTitle>
              <CardDescription>
                Browse our design services and their credit costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DesignItemsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-project">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Project Request</CardTitle>
              <CardDescription>
                Select a design service and provide project details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectRequestForm
                onSuccess={() => setActiveTab("projects")}
                refetchCredits={() => window.location.reload()} // Simple refetch for now
                creditsRemaining={creditsRemaining}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>
                Track the status of your submitted projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectHistory />
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage History</CardTitle>
              <CardDescription>
                View your credit transactions and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreditHistory />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};
