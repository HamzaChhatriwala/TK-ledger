import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase/client';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace('/(tabs)/customers');
      } else {
        router.replace('/(auth)/login');
      }
    };

    checkSession();
  }, []);

  return <LoadingSpinner message="Loading..." />;
}




