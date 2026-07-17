'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useProgressLogs } from '@/hooks/use-progress-logs';
import { supabase } from '@/lib/supabase/client';
import { uploadFile, PROGRESS_BUCKET } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Upload, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from '@/components/charts';

function fmtFull(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { logs, loading, reload } = useProgressLogs(user?.id);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    let photoPath: string | null = null;
    if (photo) {
      const path = `${user.id}/progress-${Date.now()}.jpg`;
      const { path: uploaded, error } = await uploadFile(PROGRESS_BUCKET, path, photo);
      if (error) {
        toast({ title: 'Photo upload failed', description: error, variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      photoPath = uploaded;
    }

    const { error } = await supabase.from('progress_logs').insert({
      user_id: user.id,
      weight: weight ? Number(weight) : null,
      photo_path: photoPath,
      note: note || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Check-in logged!', description: 'Great work — keep the streak going.' });
    setWeight('');
    setNote('');
    setPhoto(null);
    setPhotoPreview(null);
    reload();
  };

  const chartData = logs
    .filter((l) => l.weight != null)
    .map((l) => ({
      date: new Date(l.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: Number(l.weight),
    }));

  const photoLogs = logs.filter((l) => l.photo_path);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-4xl tracking-wide">Weekly Progress</h1>
        <p className="text-muted-foreground mt-1">Log your weight, upload a photo, and watch your transformation.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Log form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <Camera className="h-5 w-5 text-accent" /> New Weekly Check-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Current weight (kg)</Label>
                <Input id="weight" type="number" step="0.1" placeholder="78.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea id="note" placeholder="How did this week feel?" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Progress photo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-border bg-card flex items-center justify-center shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="progress-photo" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 rounded-md border border-input bg-background hover:bg-accent/10 px-3 py-2 text-sm transition-colors">
                        <Upload className="h-4 w-4" /> Choose photo
                      </div>
                    </Label>
                    <Input id="progress-photo" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Check-In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> Weight Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#ee5a2a" strokeWidth={2.5} dot={{ fill: '#f5a442', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">Log at least 2 check-ins to see your trend.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photo gallery */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide">Progress Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : photoLogs.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...photoLogs].reverse().map((log) => (
                <div key={log.id} className="group relative rounded-xl overflow-hidden border border-border bg-card">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/progress-photos/${log.photo_path}`}
                    alt={`Progress ${fmtFull(log.logged_at)}`}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="text-xs font-medium text-white">{fmtFull(log.logged_at)}</div>
                    {log.weight && <div className="text-xs text-white/70">{log.weight} kg</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Camera className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No progress photos yet. Upload one in your next check-in!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History list */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide">Check-In History</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length ? (
            <div className="space-y-2">
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{fmtFull(log.logged_at)}</div>
                    {log.note && <div className="text-xs text-muted-foreground mt-0.5">{log.note}</div>}
                  </div>
                  <div className="text-sm text-accent font-medium">
                    {log.weight != null ? `${log.weight} kg` : '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No check-ins logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
