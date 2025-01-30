import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UsersList } from "@/components/users/UsersList";

export default function UsersIndex() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useQuery({
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
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id);
      
      if (error) throw error;
      return profiles;
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

  const isLoading = isLoadingCurrentUser || isLoadingUsers;

  // If not admin, show unauthorized message
  if (!isLoadingCurrentUser && currentUser?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="glass-card p-8 rounded-lg text-center">
            <h1 className="text-2xl font-bold gradient-text mb-4">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="section-header">
        <h1 className="section-title">Users</h1>
        <p className="text-muted-foreground">
          Manage system users
        </p>
      </div>

      <div className="section-content">
        <UsersList 
          users={users}
          isLoading={isLoading}
          onUpdateApproval={(userId, isApproved) => 
            updateApprovalStatus.mutate({ userId, isApproved })}
        />
      </div>
    </AppLayout>
  );
}