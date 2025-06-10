
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { designItems } from '@/data/designItems';
import { useToast } from '@/hooks/use-toast';

interface ProjectRequestFormProps {
  onSuccess: () => void;
}

export const ProjectRequestForm = ({ onSuccess }: ProjectRequestFormProps) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [description, setDescription] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Please select a design item",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "Project request submitted successfully"
      });
      setSelectedItem('');
      setDescription('');
      setDriveLink('');
      setIsSubmitting(false);
      onSuccess();
    }, 1000);
  };

  const selectedDesignItem = designItems.find(item => item.id === selectedItem);

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
                {item.name} - {item.credits} credits
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDesignItem && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              <p><strong>Size:</strong> {selectedDesignItem.size}</p>
              <p><strong>Credits:</strong> {selectedDesignItem.credits}</p>
              <p><strong>Category:</strong> {selectedDesignItem.category}</p>
            </div>
          </CardContent>
        </Card>
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
        {isSubmitting ? 'Submitting...' : 'Submit Project Request'}
      </Button>
    </form>
  );
};
