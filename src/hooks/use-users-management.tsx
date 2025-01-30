import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useUsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!currentUser?.id || currentUser.role !== 'admin') {
        console.log('Not authorized to fetch users');
        return [];
      }

      console.log('Fetching users as admin:', currentUser.id);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return profiles || [];
    },
    enabled: !!currentUser?.id && currentUser.role === 'admin',
    gcTime: 0,
    staleTime: 0,
  });

  const updateApprovalStatus = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: string; isApproved: boolean }) => {
      console.log('Updating approval status:', { userId, isApproved });
      
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
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  return {
    currentUser,
    users,
    isLoading: isLoadingCurrentUser || isLoadingUsers,
    updateApprovalStatus,
  };
}