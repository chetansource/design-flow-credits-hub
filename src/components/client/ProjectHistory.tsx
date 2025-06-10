
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'Business Card Design',
    status: 'completed',
    submittedDate: '2024-01-15',
    credits: 2
  },
  {
    id: '2', 
    name: 'Brochure Design',
    status: 'in-progress',
    submittedDate: '2024-01-20',
    credits: 5
  },
  {
    id: '3',
    name: 'Flyer Design',
    status: 'feedback',
    submittedDate: '2024-01-22',
    credits: 3
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'in-progress':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case 'feedback':
      return <Badge className="bg-yellow-100 text-yellow-800">Feedback & Approval</Badge>;
    case 'pending':
      return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ProjectHistory = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead>Credits Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{getStatusBadge(project.status)}</TableCell>
              <TableCell>{project.submittedDate}</TableCell>
              <TableCell>{project.credits} credits</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
