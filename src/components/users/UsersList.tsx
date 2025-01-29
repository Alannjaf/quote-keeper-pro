import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UsersListProps {
  users: Profile[];
  isLoading: boolean;
  onUpdateApproval: (userId: string, isApproved: boolean) => void;
}

export function UsersList({ users, isLoading, onUpdateApproval }: UsersListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.username || 'Not set'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.is_approved ? 'default' : 'destructive'}
                    className={user.is_approved ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateApproval(user.id, !user.is_approved)}
                    className={`flex items-center gap-2 ${!user.is_approved ? '' : 'text-destructive'}`}
                  >
                    {!user.is_approved ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Revoke
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}