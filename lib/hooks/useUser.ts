import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import type { User, UserRole } from '../../types';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as User;
    },
  });
}

export function useUserRole(): UserRole | null {
  const { data: user } = useUser();
  return user?.role || null;
}

