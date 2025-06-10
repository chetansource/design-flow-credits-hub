
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const CreditBalance = () => {
  // Mock data - in production, fetch from Firebase
  // Each client starts with 110 credits per month
  const monthlyCredits = 110;
  const carryoverCredits = 15; // Example: carried over from previous month
  const totalAvailableCredits = monthlyCredits + carryoverCredits; // 125 total
  const usedCredits = 30; // Example: used this month
  const currentCredits = totalAvailableCredits - usedCredits; // 95 remaining
  const usagePercentage = (usedCredits / totalAvailableCredits) * 100;

  return (
    <Card className="col-span-full md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Credit Balance</CardTitle>
        <CardDescription>Your available design credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{currentCredits}</div>
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
              +{carryoverCredits}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Used this month:</span>
            <span>{usedCredits}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total available:</span>
            <span>{totalAvailableCredits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
