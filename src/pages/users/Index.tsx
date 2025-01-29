import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default function UsersIndex() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return profile;
    },
  });

  // Fetch all users except current admin
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser && currentUser.role === 'admin',
  });

  // Mutation to update user approval status
  const updateApprovalStatus = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: isApproved })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // If not admin, show unauthorized message
  if (currentUser?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Unauthorized Access</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage system users
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : profiles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    {profile.first_name} {profile.last_name}
                  </TableCell>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.is_approved ? 'success' : 'destructive'}>
                      {profile.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!profile.is_approved ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApprovalStatus.mutate({ 
                          userId: profile.id, 
                          isApproved: true 
                        })}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateApprovalStatus.mutate({ 
                          userId: profile.id, 
                          isApproved: false 
                        })}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}