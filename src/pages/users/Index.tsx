import { AppLayout } from "@/components/layout/AppLayout";
import { useUsersManagement } from "@/hooks/use-users-management";
import { UsersList } from "@/components/users/UsersList";
import { UnauthorizedAccess } from "@/components/users/UnauthorizedAccess";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function UsersIndex() {
  const queryClient = useQueryClient();
  const { currentUser, users, isLoading, updateApprovalStatus } = useUsersManagement();

  // Set up real-time subscription for profiles table
  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'admin') {
      console.log('Not setting up subscription - user not admin');
      return;
    }

    console.log('Setting up real-time subscription for admin:', currentUser.id);

    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id.neq.${currentUser.id}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentUser?.role, queryClient]);

  // If not admin, show unauthorized message
  if (!isLoading && currentUser?.role !== 'admin') {
    return (
      <AppLayout>
        <UnauthorizedAccess />
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