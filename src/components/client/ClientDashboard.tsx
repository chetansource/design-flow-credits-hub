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
import { useAuth } from "@/hooks/useAuth";

export const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="new-project">New Project</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="credits">Credit History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CreditBalance />
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

        <TabsContent value="credits">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
