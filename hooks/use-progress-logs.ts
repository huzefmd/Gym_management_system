'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProgressLog } from '@/lib/types';

export function useProgressLogs(userId: string | undefined) {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });
    setLogs((data as ProgressLog[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { logs, loading, reload: load };
}
