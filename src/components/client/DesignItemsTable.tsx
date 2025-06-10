
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { designItems } from '@/data/designItems';

export const DesignItemsTable = () => {
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
          {designItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.size}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.credits} credits</Badge>
              </TableCell>
              <TableCell className="capitalize">{item.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
