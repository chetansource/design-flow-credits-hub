
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockCreditHistory = [
  {
    id: '1',
    type: 'used',
    amount: -2,
    description: 'Business Card Design',
    date: '2024-01-15',
    balance: 108
  },
  {
    id: '2',
    type: 'used',
    amount: -5,
    description: 'Brochure Design',
    date: '2024-01-20',
    balance: 103
  },
  {
    id: '3',
    type: 'added',
    amount: 110,
    description: 'Monthly credit allocation',
    date: '2024-02-01',
    balance: 213
  },
  {
    id: '4',
    type: 'used',
    amount: -3,
    description: 'Flyer Design',
    date: '2024-02-05',
    balance: 210
  }
];

export const CreditHistory = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCreditHistory.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>
                <Badge 
                  variant={transaction.type === 'added' ? 'default' : 'secondary'}
                  className={transaction.type === 'added' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {transaction.type === 'added' ? 'Credit Added' : 'Credit Used'}
                </Badge>
              </TableCell>
              <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell className="font-medium">{transaction.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
