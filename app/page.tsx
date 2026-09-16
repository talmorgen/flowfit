'use client';

import { useEffect, useState } from 'react';
import { Activity, ArrowDown, ArrowRight, ArrowUp, CalendarDays, Check, ChevronLeft, Dumbbell, ExternalLink, Footprints, HeartPulse, Mic, Minus, Music2, Pencil, Plus, RefreshCw, Save, Sparkles, Target, Timer, Trash2, TrendingUp, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Exercise = { id: number; name: string; sets: number; reps: number; weight: number | null; note?: string };
type Plan = { id: number; name: string; subtitle: string; accent: string; exercises: Exercise[]; kind?: 'strength' | 'run'; distanceKm?: number; targetPace?: string };
type Screen = 'dashboard' | 'plans' | 'new-plan' | 'choose' | 'workout';
type ActiveWorkoutSession = { workoutId: string; planId: number; exerciseId: number; completedSets: number; rpe: number; screen: 'choose' | 'workout'; startedAt: string; updatedAt: string };

const ACTIVE_WORKOUT_KEY = 'flowfit-active-workout';

const initialPlans: Plan[] = [
  { id: 1, name: 'Full Body A', subtitle: 'האימון הנוכחי · 8 תרגילים', accent: 'lime', exercises: [
    { id: 1, name: 'סקוואט', sets: 3, reps: 7, weight: 70 },
    { id: 2, name: 'לחיצת חזה במוט', sets: 3, reps: 8, weight: 50 },
    { id: 3, name: 'מתח', sets: 3, reps: 5, weight: null },
    { id: 4, name: "לאנג׳ / ספליט סקוואט", sets: 2, reps: 10, weight: 10 },
    { id: 5, name: 'חתירה הפוכה', sets: 2, reps: 12, weight: null },
    { id: 6, name: 'הרחקות כתפיים', sets: 2, reps: 12, weight: 7 },
    { id: 7, name: 'כפיפות מרפקים', sets: 2, reps: 12, weight: 8 },
    { id: 8, name: 'בטן', sets: 2, reps: 15, weight: null },
  ]},
  { id: 2, name: 'Full Body B', subtitle: 'דדליפט ומשיכות · 7 תרגילים', accent: 'blue', exercises: [
    { id: 9, name: 'דדליפט', sets: 3, reps: 8, weight: 70 },
    { id: 10, name: 'לחיצת כתפיים', sets: 3, reps: 8, weight: 30 },
    { id: 11, name: 'מתח', sets: 3, reps: 5, weight: null },
    { id: 12, name: 'חתירה במכונה', sets: 2, reps: 10, weight: 45 },
  ]},
  { id: 3, name: 'Surf Support', subtitle: 'יציבות וכוח מתפרץ · 5 תרגילים', accent: 'cyan', exercises: [
    { id: 13, name: 'Box Jump', sets: 4, reps: 4, weight: null },
    { id: 14, name: 'Single Leg RDL', sets: 3, reps: 8, weight: 20 },
    { id: 15, name: 'Pallof Press', sets: 3, reps: 10, weight: 12 },
  ]},
  { id: 4, name: 'ריצת בסיס', subtitle: '5.5 ק״מ · קצב נוח', accent: 'orange', kind: 'run', distanceKm: 5.5, targetPace: '5:45', exercises: [] },
];

export default function Home() {
  const [plans, setPlans] = useState(initialPlans);
  const [plansReady, setPlansReady] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(1);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [editing, setEditing] = useState(true);
  const [activeExerciseId, setActiveExerciseId] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [rpe, setRpe] = useState(7);
  const [workoutId, setWorkoutId] = useState('');
  const [workoutStartedAt, setWorkoutStartedAt] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)!;
  const activeExercise = selectedPlan.exercises.find((exercise) => exercise.id === activeExerciseId) ?? selectedPlan.exercises[0];

  useEffect(() => { try { const saved = localStorage.getItem('flowfit-plans'); if (saved) { const parsed = JSON.parse(saved) as Plan[]; if (parsed.length) { setPlans(parsed); setSelectedPlanId(parsed[0].id); } } } catch { /* keep defaults */ } finally { setPlansReady(true); } }, []);
  useEffect(() => { if (plansReady) localStorage.setItem('flowfit-plans', JSON.stringify(plans)); }, [plans, plansReady]);
  useEffect(() => {
    if (!plansReady || sessionReady) return;
    try {
      const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (saved) {
        const session = JSON.parse(saved) as ActiveWorkoutSession;
        const savedPlan = plans.find((plan) => plan.id === session.planId);
        const savedExercise = savedPlan?.exercises.find((exercise) => exercise.id === session.exerciseId);
        if (savedPlan && savedExercise && session.workoutId) {
          setSelectedPlanId(session.planId); setActiveExerciseId(session.exerciseId); setCompletedSets(session.completedSets || 0);
          setRpe(session.rpe || 7); setWorkoutId(session.workoutId); setWorkoutStartedAt(session.startedAt || new Date().toISOString());
          setScreen(session.screen || 'workout');
        }
      }
    } catch { localStorage.removeItem(ACTIVE_WORKOUT_KEY); }
    finally { setSessionReady(true); }
  }, [plans, plansReady, sessionReady]);
  useEffect(() => {
    if (!sessionReady || !workoutId || (screen !== 'workout' && screen !== 'choose')) return;
    const session: ActiveWorkoutSession = { workoutId, planId: selectedPlanId, exerciseId: activeExerciseId, completedSets, rpe, screen, startedAt: workoutStartedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(session));
  }, [activeExerciseId, completedSets, rpe, screen, selectedPlanId, sessionReady, workoutId, workoutStartedAt]);

  function updateExercise(id: number, field: 'sets' | 'reps' | 'weight', delta: number) {
    setPlans((current) => current.map((plan) => plan.id !== selectedPlanId ? plan : {
      ...plan, exercises: plan.exercises.map((exercise) => exercise.id !== id ? exercise : {
        ...exercise, [field]: field === 'weight' ? Math.max(0, (exercise.weight ?? 0) + delta) : Math.max(1, exercise[field] + delta),
      }),
    }));
  }

  function removeExercise(id: number) {
    setPlans((current) => current.map((plan) => plan.id === selectedPlanId ? { ...plan, exercises: plan.exercises.filter((exercise) => exercise.id !== id) } : plan));
  }

  function moveExercise(id: number, direction: -1 | 1) {
    setPlans((current) => current.map((plan) => {
      if (plan.id !== selectedPlanId) return plan;
      const index = plan.exercises.findIndex((exercise) => exercise.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= plan.exercises.length) return plan;
      const exercises = [...plan.exercises];
      [exercises[index], exercises[nextIndex]] = [exercises[nextIndex], exercises[index]];
      return { ...plan, exercises };
    }));
  }

  function renameExercise(id: number, name: string) {
    setPlans((current) => current.map((plan) => plan.id === selectedPlanId ? {
      ...plan,
      exercises: plan.exercises.map((exercise) => exercise.id === id ? { ...exercise, name } : exercise),
    } : plan));
  }

  function addExercise(exercise: Omit<Exercise, 'id'>) {
    setPlans((current) => current.map((plan) => plan.id === selectedPlanId ? {
      ...plan,
      subtitle: `${plan.name === 'Full Body A' ? 'האימון הנוכחי · ' : ''}${plan.exercises.length + 1} תרגילים`,
      exercises: [...plan.exercises, { ...exercise, id: Date.now() }],
    } : plan));
  }

  function createPlan(plan: Plan) {
    setPlans((current) => [...current, plan]);
    setSelectedPlanId(plan.id);
    setScreen('plans');
  }

  function deletePlan(id: number) {
    if (plans.length <= 1) return;
    const plan = plans.find((item) => item.id === id);
    if (!plan) return;
    const remaining = plans.filter((item) => item.id !== id);
    setPlans(remaining);
    if (selectedPlanId === id) setSelectedPlanId(remaining[0].id);
  }

  function generateComplementaryPlan() {
    const existingNames = new Set(plans.flatMap((plan) => plan.exercises.map((exercise) => exercise.name)));
    const categories = ['legs', 'hinge', 'pull', 'push', 'shoulders', 'core'];
    const categoryCounts = Object.fromEntries(categories.map((category) => [category, recommendedExercises.filter((item) => item.category === category && existingNames.has(item.name)).length]));
    const selected = categories.sort((a, b) => categoryCounts[a] - categoryCounts[b]).flatMap((category) => {
      const options = recommendedExercises.filter((item) => item.category === category && !existingNames.has(item.name));
      return (options.length ? options : recommendedExercises.filter((item) => item.category === category)).slice(0, 1);
    });
    for (const item of recommendedExercises) if (selected.length < 8 && !selected.some((choice) => choice.name === item.name) && !existingNames.has(item.name)) selected.push(item);
    const id = Date.now();
    const plan: Plan = { id, name: `אימון משלים ${plans.filter((item) => item.kind !== 'run').length + 1}`, subtitle: `נוצר אוטומטית · ${selected.length} תרגילים`, accent: 'cyan', kind: 'strength', exercises: selected.map((item, index) => ({ id: id + index + 1, name: item.name, sets: item.sets, reps: item.reps, weight: item.weight })) };
    setPlans((current) => [...current, plan]); setSelectedPlanId(id); setEditing(true); setScreen('plans');
  }

  function updateRunPlan(field: 'distanceKm' | 'targetPace', value: number | string) {
    setPlans((current) => current.map((plan) => plan.id === selectedPlanId ? { ...plan, [field]: value, subtitle: field === 'distanceKm' ? `${value} ק״מ · קצב ${plan.targetPace}` : `${plan.distanceKm} ק״מ · קצב ${value}` } : plan));
  }

  return (
    <main dir="rtl" className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-background/92 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><HeartPulse size={21} /></div><div><p className="text-xs text-muted-foreground">FlowFit</p><h1 className="font-bold">{screen === 'dashboard' ? 'הסקירה שלי' : screen === 'plans' ? 'תוכניות האימון שלי' : screen === 'new-plan' ? 'תוכנית חדשה' : screen === 'choose' ? 'בחירת תרגיל פתיחה' : 'אימון בתהליך'}</h1></div></div>
          <div className="flex items-center gap-2">{(screen === 'dashboard' || screen === 'plans') && <><button onClick={() => setScreen('dashboard')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${screen === 'dashboard' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>סקירה</button><button onClick={() => setScreen('plans')} className={`rounded-xl px-3 py-2 text-xs font-semibold ${screen === 'plans' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>תוכניות</button></>}{screen !== 'dashboard' && screen !== 'plans' && <button onClick={() => setScreen(screen === 'workout' ? 'choose' : 'plans')} className="rounded-full bg-card p-2.5" aria-label="חזרה"><ArrowRight size={18} /></button>}</div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-5">
        {screen === 'dashboard' && <Dashboard plans={plans} onPlans={() => setScreen('plans')} onStart={(planId) => { setSelectedPlanId(planId); setScreen('choose'); }} />}
        {screen === 'plans' && <PlansScreen plans={plans} selectedPlan={selectedPlan} selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId} editing={editing} setEditing={setEditing} updateExercise={updateExercise} updateRunPlan={updateRunPlan} removeExercise={removeExercise} moveExercise={moveExercise} renameExercise={renameExercise} addExercise={addExercise} deletePlan={deletePlan} generateComplementaryPlan={generateComplementaryPlan} setScreen={setScreen} />}
        {screen === 'new-plan' && <NewPlanScreen onCancel={() => setScreen('plans')} onCreate={createPlan} />}
        {screen === 'choose' && <ChooseScreen plan={selectedPlan} onChoose={(id) => { if (!workoutId) { setWorkoutId(crypto.randomUUID()); setWorkoutStartedAt(new Date().toISOString()); } setActiveExerciseId(id); setCompletedSets(0); setScreen('workout'); }} />}
        {screen === 'workout' && <WorkoutScreen key={`${workoutId}:${activeExercise.id}`} workoutId={workoutId} workoutStartedAt={workoutStartedAt} plan={selectedPlan} exercise={activeExercise} completedSets={completedSets} setCompletedSets={setCompletedSets} rpe={rpe} setRpe={setRpe} onSwitch={() => setScreen('choose')} onNext={() => { const index = selectedPlan.exercises.findIndex((item) => item.id === activeExercise.id); const next = selectedPlan.exercises[(index + 1) % selectedPlan.exercises.length]; setActiveExerciseId(next.id); setCompletedSets(0); }} />}
      </div>
    </main>
  );
}

function parseGarminDate(value: string) {
  const match = value?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0));
  return new Date(value);
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function garminActivityName(activity: string[], match?: string) {
  if (activity[2] === 'strength_training') return match || 'אימון כוח';
  if (activity[2] === 'running') return activity[3] && activity[3] !== 'Base' ? activity[3] : 'ריצה';
  if (activity[2] === 'surfing_v2') return 'גלישה';
  if (activity[2] === 'lap_swimming') return 'שחייה';
  if (activity[2] === 'yoga') return 'יוגה';
  return activity[3] || activity[2] || 'פעילות';
}

function Dashboard({ plans, onPlans, onStart }: { plans: Plan[]; onPlans: () => void; onStart: (planId: number) => void }) {
  const [sheetState, setSheetState] = useState<'loading' | 'connected' | 'error'>('loading');
  const [recordCount, setRecordCount] = useState(0);
  const [garmin, setGarmin] = useState<{ latestHealth: string[] | null; activities: string[][] }>({ latestHealth: null, activities: [] });
  const [garminSyncState, setGarminSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [activityMatches, setActivityMatches] = useState<Record<string, string>>({});
  const [todayChoice, setTodayChoice] = useState('recommended');
  const [waveForecast, setWaveForecast] = useState<Array<{ date: string; height: number; period: number; direction: number }>>([]);
  useEffect(() => { fetch('/api/sheets').then((response) => response.json() as Promise<{ ok: boolean; sets?: unknown[]; workouts?: unknown[] }>).then((data) => { if (!data.ok) throw new Error(); setRecordCount(data.sets?.length ?? data.workouts?.length ?? 0); setSheetState('connected'); }).catch(() => setSheetState('error')); }, []);
  async function loadGarmin() {
    const response = await fetch(`/api/sheets?source=garmin&t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json() as { ok: boolean; latestHealth?: string[] | null; activities?: string[][] };
    if (!data.ok) throw new Error('garmin_data_unavailable');
    setGarmin({ latestHealth: data.latestHealth ?? null, activities: data.activities ?? [] });
  }
  useEffect(() => { loadGarmin().catch(() => undefined); }, []);
  useEffect(() => { try { setActivityMatches(JSON.parse(localStorage.getItem('flowfit-garmin-matches') || '{}')); } catch { setActivityMatches({}); } }, []);
  useEffect(() => { setTodayChoice(localStorage.getItem('flowfit-today-choice') || 'recommended'); fetch('/api/waves').then((response) => response.json()).then((data: { daily?: { time?: string[]; wave_height_max?: number[]; wave_period_max?: number[]; wave_direction_dominant?: number[] } }) => { const daily = data.daily; if (!daily?.time) return; setWaveForecast(daily.time.map((date, index) => ({ date, height: Number(daily.wave_height_max?.[index] || 0), period: Number(daily.wave_period_max?.[index] || 0), direction: Number(daily.wave_direction_dominant?.[index] || 0) }))); }).catch(() => undefined); }, []);
  function saveActivityMatch(activityId: string, planName: string) {
    const next = { ...activityMatches };
    if (planName) next[activityId] = planName; else delete next[activityId];
    setActivityMatches(next);
    localStorage.setItem('flowfit-garmin-matches', JSON.stringify(next));
  }
  async function syncGarminNow() {
    if (garminSyncState === 'syncing') return;
    setGarminSyncState('syncing');
    try {
      const response = await fetch('/api/garmin-sync', { method: 'POST' });
      const data = await response.json() as { ok?: boolean };
      if (!response.ok || !data.ok) throw new Error('sync_failed');
      await loadGarmin();
      setGarminSyncState('success');
    } catch {
      setGarminSyncState('error');
    }
  }
  const health = garmin.latestHealth;
  const readiness = Number(health?.[12] || 0);
  const sleepScore = Number(health?.[1] || 0);
  const sleepHours = Number(health?.[2] || 0);
  const strengthPlans = plans.filter((plan) => plan.kind !== 'run');
  const sortedActivities = [...garmin.activities].sort((a, b) => parseGarminDate(b[1]).getTime() - parseGarminDate(a[1]).getTime());
  const lastStrength = sortedActivities.find((activity) => activity[2] === 'strength_training' && activityMatches[activity[0]]);
  const lastMatchedPlan = lastStrength ? activityMatches[lastStrength[0]] : '';
  const nextStrengthPlan = lastMatchedPlan === 'Full Body A' ? 'Full Body B' : lastMatchedPlan === 'Full Body B' ? 'Full Body A' : strengthPlans[0]?.name || 'אימון כוח';
  const latestTime = sortedActivities[0] ? parseGarminDate(sortedActivities[0][1]).getTime() : 0;
  const recentSurf = sortedActivities.some((activity) => activity[2] === 'surfing_v2' && latestTime - parseGarminDate(activity[1]).getTime() <= 36 * 60 * 60 * 1000);
  const recoveryDay = (readiness > 0 && readiness < 45) || (sleepScore > 0 && sleepScore < 55) || (sleepHours > 0 && sleepHours < 5.5);
  const recommendation = recoveryDay
    ? { title: 'התאוששות פעילה', detail: 'הליכה קלה, מוביליטי או מנוחה מלאה', reason: readiness > 0 && readiness < 45 ? `מוכנות Garmin נמוכה (${readiness})` : `השינה האחרונה נמוכה מהיעד` }
    : { title: nextStrengthPlan, detail: recentSurf ? 'אימון כוח מקוצר · פחות סט אחד בתרגילי משיכה' : 'אימון כוח מלא · עומס בינוני', reason: lastMatchedPlan ? `האימון האחרון שויך ל־${lastMatchedPlan}` : 'אין עדיין אימון כוח משויך ב־7 הימים האחרונים' };
  const choices = [{ id: 'recommended', label: 'לפי ההמלצה', icon: <Target size={17} /> }, { id: 'surf', label: 'גלישה', icon: <Waves size={17} /> }, { id: 'run', label: 'ריצה', icon: <Footprints size={17} /> }, ...strengthPlans.map((plan) => ({ id: `plan:${plan.id}`, label: plan.name, icon: <Dumbbell size={17} /> })), { id: 'rest', label: 'מנוחה', icon: <HeartPulse size={17} /> }];
  const selectedPlanChoice = todayChoice.startsWith('plan:') ? plans.find((plan) => plan.id === Number(todayChoice.slice(5))) : undefined;
  const todayTitle = todayChoice === 'recommended' ? recommendation.title : todayChoice === 'surf' ? 'גלישה' : todayChoice === 'run' ? plans.find((plan) => plan.kind === 'run')?.name || 'ריצה' : todayChoice === 'rest' ? 'מנוחה והתאוששות' : selectedPlanChoice?.name || recommendation.title;
  const today = new Date();
  const weekStart = new Date(today); weekStart.setHours(0, 0, 0, 0); weekStart.setDate(weekStart.getDate() - 6);
  const weekActivities = sortedActivities.filter((activity) => parseGarminDate(activity[1]) >= weekStart);
  const weekMinutes = Math.round(weekActivities.reduce((sum, activity) => sum + (Number(activity[4]) || 0), 0));
  const weekDistance = weekActivities.reduce((sum, activity) => sum + (Number(activity[5]) || 0), 0);
  const weekLoad = Math.round(weekActivities.reduce((sum, activity) => sum + (Number(activity[11]) || 0), 0));
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index)); return date; });
  const todayLabel = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
  return <div className="space-y-5">
    <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">{todayLabel}</p><h2 className="mt-1 text-3xl font-bold">בוקר טוב, טל</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sheetState === 'connected' ? 'bg-emerald-400/10 text-emerald-400' : sheetState === 'error' ? 'bg-red-400/10 text-red-400' : 'bg-muted text-muted-foreground'}`}>{sheetState === 'connected' ? `Google Sheets מחובר · ${recordCount} רשומות` : sheetState === 'error' ? 'שגיאת סנכרון' : 'מתחבר ל־Google Sheets…'}</span></div>
    <Card className="border-primary/25 bg-[linear-gradient(145deg,#153f49,#0a252d)] p-5 text-white"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-cyan-100/60">מה כדאי לעשות היום?</p><h3 className="mt-1 text-2xl font-bold">{recommendation.title}</h3><p className="mt-2 text-sm text-cyan-50/75">{recommendation.detail} · {recommendation.reason}</p></div><Target className="shrink-0 text-primary" size={28} /></div><div className="mt-5 flex gap-2 overflow-x-auto pb-1">{choices.map((choice) => <button key={choice.id} onClick={() => { setTodayChoice(choice.id); localStorage.setItem('flowfit-today-choice', choice.id); }} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${todayChoice === choice.id ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}`}>{choice.icon}{choice.label}</button>)}</div><p className="mt-3 text-[11px] text-cyan-50/50">הבחירה שלך להיום: <strong className="text-cyan-50/80">{todayTitle}</strong>. אפשר לשנות בכל רגע.</p></Card>
    <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(145deg,#153f49,#0a252d)] p-5 text-white"><div className="flex items-start justify-between"><div><p className="text-xs text-cyan-100/60">התוכנית שבחרת להיום</p><h3 className="mt-2 text-2xl font-bold">{todayTitle}</h3><p className="mt-2 text-sm text-cyan-50/65">{todayChoice === 'recommended' ? 'מבוסס על היסטוריית Garmin וההתאוששות' : 'בחירה ידנית שלך להיום'}</p></div>{todayChoice === 'surf' ? <Waves className="text-cyan-300" size={28} /> : todayChoice === 'run' ? <Footprints className="text-orange-400" size={28} /> : <Dumbbell className="text-primary" size={28} />}</div><div className="mt-6 flex gap-3">{!recoveryDay && todayChoice !== 'surf' && todayChoice !== 'rest' && todayChoice !== 'run' && <Button onClick={() => onStart(selectedPlanChoice?.id || strengthPlans.find((plan) => plan.name === recommendation.title)?.id || strengthPlans[0]?.id || 1)} className="flex-1 font-bold">התחלת אימון</Button>}<button onClick={onPlans} className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold">פתיחת תוכניות</button></div></Card>
      <Card className="border-border/70 bg-card p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-400"><Waves size={22} /></span><div><p className="font-bold">תחזית גלים · בית ינאי</p><p className="text-xs text-muted-foreground">היום ועוד 3 ימים</p></div></div></div><div className="mt-4 grid grid-cols-2 gap-2">{waveForecast.length ? waveForecast.map((day, index) => <div key={day.date} className="rounded-xl bg-muted/55 p-3"><p className="text-[11px] text-muted-foreground">{index === 0 ? 'היום' : new Intl.DateTimeFormat('he-IL', { weekday: 'short' }).format(new Date(`${day.date}T12:00:00`))}</p><strong className="mt-1 block text-lg">{day.height.toFixed(1)} מ׳</strong><p className="mt-1 text-[10px] text-muted-foreground">מחזור {day.period.toFixed(0)} שנ׳ · {Math.round(day.direction)}°</p></div>) : <p className="col-span-2 py-5 text-center text-xs text-muted-foreground">טוען תחזית ימית…</p>}</div><p className="mt-3 text-[10px] text-muted-foreground">מקור: Open-Meteo Marine Weather API</p></Card>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
      <Card className="border-border/70 bg-card p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">7 הימים האחרונים</p><h3 className="mt-1 font-bold">סיכום Garmin</h3></div><Activity size={20} className="text-emerald-400" /></div><div className="mt-5 grid grid-cols-2 gap-3"><SummaryStat label="פעילויות" value={String(weekActivities.length)} /><SummaryStat label="זמן אימון" value={`${weekMinutes} דק׳`} /><SummaryStat label="מרחק" value={`${weekDistance.toFixed(1)} ק״מ`} /><SummaryStat label="עומס Garmin" value={weekLoad ? String(weekLoad) : '—'} /></div></Card>
      <Card className="border-primary/25 bg-[linear-gradient(145deg,#123944,#0a252d)] p-5 text-white"><div className="flex items-start justify-between"><div><p className="text-xs text-cyan-100/60">למה זו ההמלצה?</p><h3 className="mt-1 text-xl font-bold">{recommendation.title}</h3></div><Target size={24} className="text-primary" /></div><p className="mt-4 text-sm leading-6 text-cyan-50/75">{recommendation.reason}. {recentSurf ? 'זוהתה גלישה לאחרונה ולכן אימון המשיכות הוקל.' : 'לא זוהתה גלישה קרובה שמחייבת הפחתת עומס.'}</p><div className="mt-4 flex gap-2 text-xs"><span className="rounded-lg bg-white/10 px-2 py-1">מוכנות {readiness || '—'}</span><span className="rounded-lg bg-white/10 px-2 py-1">שינה {sleepScore || '—'}</span></div></Card>
    </div>
    <Card className="border-border/70 bg-card p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Garmin Connect</p><h3 className="mt-1 font-bold">7 הימים האחרונים</h3></div><button onClick={syncGarminNow} disabled={garminSyncState === 'syncing'} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-wait ${garminSyncState === 'error' ? 'bg-red-400/10 text-red-400' : garminSyncState === 'success' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-primary/10 text-primary hover:bg-primary/15'}`}><RefreshCw size={15} className={garminSyncState === 'syncing' ? 'animate-spin' : ''} />{garminSyncState === 'syncing' ? 'מסנכרן…' : garminSyncState === 'success' ? 'סונכרן עכשיו' : garminSyncState === 'error' ? 'נסה שוב' : 'סנכרון עכשיו'}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-7">{lastSevenDays.map((date) => { const activities = sortedActivities.filter((activity) => localDateKey(parseGarminDate(activity[1])) === localDateKey(date)); const isToday = localDateKey(date) === localDateKey(today); return <div key={localDateKey(date)} className={`min-h-36 rounded-2xl border p-3 ${isToday ? 'border-primary/55 bg-primary/5' : 'border-border/70 bg-muted/25'}`}><div className="flex items-center justify-between"><div><p className="text-xs font-bold">{new Intl.DateTimeFormat('he-IL', { weekday: 'short' }).format(date)}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</p></div>{isToday && <span className="h-2 w-2 rounded-full bg-primary" />}</div><div className="mt-3 space-y-2">{activities.length === 0 ? <p className="text-[11px] text-muted-foreground">מנוחה</p> : activities.map((activity) => <div key={activity[0]} className="rounded-xl bg-card p-2"><p className="text-xs font-semibold">{garminActivityName(activity, activityMatches[activity[0]])}</p><p className="mt-1 text-[10px] text-muted-foreground">{Math.round(Number(activity[4]) || 0)} דק׳{Number(activity[5]) > 0 ? ` · ${Number(activity[5]).toFixed(1)} ק״מ` : ''}</p>{activity[2] === 'strength_training' && <select aria-label="שיוך אימון Garmin לתוכנית" value={activityMatches[activity[0]] || ''} onChange={(event) => saveActivityMatch(activity[0], event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-muted px-1.5 py-1 text-[10px] text-foreground"><option value="">שיוך לתוכנית…</option>{strengthPlans.map((plan) => <option key={plan.id} value={plan.name}>{plan.name}</option>)}</select>}</div>)}</div></div>; })}</div><p className="mt-4 text-[11px] leading-5 text-muted-foreground">אימון כוח מ־Garmin מוצג בשם התוכנית ששייכת לו. השיוך נשמר במכשיר הזה ומשפיע על המלצת האימון הבא.</p></Card>
  </div>;
}

function MetricCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) { return <Card className="border-border/70 bg-card p-4"><div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><span className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</span></div></Card>; }
function SummaryStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/45 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><strong className="mt-1 block text-lg">{value}</strong></div>; }
function Upcoming({ day, title, time, color }: { day: string; title: string; time: string; color: string }) { return <div className="flex items-center gap-3 rounded-xl bg-muted/45 p-3"><span className={`h-8 w-1 rounded-full ${color}`} /><div className="flex-1"><p className="text-xs text-muted-foreground">{day} · {time}</p><p className="mt-0.5 text-sm font-semibold">{title}</p></div></div>; }

function NewPlanScreen({ onCancel, onCreate }: { onCancel: () => void; onCreate: (plan: Plan) => void }) {
  const [kind, setKind] = useState<'strength' | 'run'>('strength'); const [name, setName] = useState(''); const [distance, setDistance] = useState(5.5); const [pace, setPace] = useState('5:45');
  function submit() { const id = Date.now(); if (kind === 'run') onCreate({ id, name: name || 'תוכנית ריצה', subtitle: `${distance} ק״מ · קצב ${pace}`, accent: 'orange', kind: 'run', distanceKm: distance, targetPace: pace, exercises: [] }); else onCreate({ id, name: name || 'תוכנית כוח חדשה', subtitle: 'תוכנית חדשה · תרגיל אחד', accent: 'lime', kind: 'strength', exercises: [{ id: id + 1, name: 'תרגיל חדש', sets: 3, reps: 8, weight: 0 }] }); }
  return <div className="mx-auto max-w-2xl"><Card className="border-border/70 bg-card p-5 sm:p-7"><div><p className="text-xs text-muted-foreground">שלב 1 מתוך 2</p><h2 className="mt-1 text-3xl font-bold">איזו תוכנית נבנה?</h2></div><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => setKind('strength')} className={`rounded-2xl border p-5 text-right ${kind === 'strength' ? 'border-primary bg-primary/8' : 'border-border'}`}><Dumbbell className="text-primary" /><strong className="mt-3 block">אימון כוח</strong><span className="mt-1 block text-xs text-muted-foreground">תרגילים, סטים ומשקלים</span></button><button onClick={() => setKind('run')} className={`rounded-2xl border p-5 text-right ${kind === 'run' ? 'border-orange-400 bg-orange-400/8' : 'border-border'}`}><Footprints className="text-orange-400" /><strong className="mt-3 block">תוכנית ריצה</strong><span className="mt-1 block text-xs text-muted-foreground">מרחק, קצב ומשך</span></button></div><label className="mt-6 block text-sm font-semibold">שם התוכנית<Input value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === 'run' ? 'למשל: ריצת בוקר' : 'למשל: Full Body C'} className="mt-2 h-12 bg-muted/45" /></label>{kind === 'run' && <div className="mt-5 grid grid-cols-2 gap-4"><label className="text-sm font-semibold">מרחק בק״מ<Input type="number" min="1" max="50" step="0.5" value={distance} onChange={(event) => setDistance(Number(event.target.value))} className="mt-2 h-12 bg-muted/45" /></label><label className="text-sm font-semibold">קצב יעד לק״מ<Input value={pace} onChange={(event) => setPace(event.target.value)} className="mt-2 h-12 bg-muted/45" /></label></div>}<div className="mt-7 flex gap-3"><Button onClick={submit} className="h-13 flex-1 font-bold">יצירת התוכנית</Button><button onClick={onCancel} className="rounded-xl bg-muted px-5 text-sm font-semibold">ביטול</button></div></Card></div>;
}

const recommendedExercises = [
  { name: 'גובלט סקוואט', category: 'legs', description: 'רגליים, ליבה ויציבות — בסיס טוב לעמידה על הגלשן.', sets: 3, reps: 10, weight: 20, gif: 'yn8yg1r.gif' },
  { name: 'סקוואט', category: 'legs', description: 'כוח רגליים מלא ויציבות תחת עומס.', sets: 3, reps: 7, weight: 70, gif: 'qXTaZnJ.gif' },
  { name: "לאנג׳ / ספליט סקוואט", category: 'legs', description: 'כוח חד־צדדי, שיווי משקל ושליטה בברך.', sets: 3, reps: 10, weight: 10, gif: 'HBYyX94.gif' },
  { name: 'Box Jump', category: 'legs', description: 'כוח מתפרץ ונחיתה יציבה לקימה מהירה.', sets: 4, reps: 4, weight: 0, gif: 'iPm26QU.gif' },
  { name: 'דדליפט רומני', category: 'hinge', description: 'שרשרת אחורית והמסטרינג לשיפור כוח ויציבות.', sets: 3, reps: 8, weight: 50, gif: 'wQ2c4XD.gif' },
  { name: 'דדליפט', category: 'hinge', description: 'כוח כללי לירך, גב וליבה.', sets: 3, reps: 6, weight: 70, gif: 'ila4NZS.gif' },
  { name: 'Single Leg RDL', category: 'hinge', description: 'יציבות קרסול ואגן עם חיזוק שרשרת אחורית.', sets: 3, reps: 8, weight: 20, gif: 'gKozT8X.gif' },
  { name: 'פולי עליון', category: 'pull', description: 'גב רחב וכוח משיכה שמסייע בחתירה.', sets: 3, reps: 10, weight: 40, gif: 'rkg41Fb.gif' },
  { name: 'מתח', category: 'pull', description: 'כוח משיכה יחסי לגב ולזרועות.', sets: 3, reps: 5, weight: 0, gif: 'lBDjFxJ.gif' },
  { name: 'חתירה הפוכה', category: 'pull', description: 'גב עליון ושכמות תוך שמירת גוף יציב.', sets: 3, reps: 10, weight: 0, gif: '4OaumBr.gif' },
  { name: 'חתירה במכונה', category: 'pull', description: 'נפח משיכה נשלט לגב העליון.', sets: 3, reps: 10, weight: 45, gif: '7I6LNUG.gif' },
  { name: 'לחיצת חזה במוט', category: 'push', description: 'כוח דחיפה לחזה, כתפיים ויד אחורית.', sets: 3, reps: 8, weight: 50, gif: 'EIeI8Vf.gif' },
  { name: 'שכיבות סמיכה', category: 'push', description: 'חזה, כתפיים וליבה לקימה חזקה ויציבה.', sets: 3, reps: 12, weight: 0, gif: 'I4hDWkc.gif' },
  { name: 'לחיצת כתפיים', category: 'push', description: 'כוח דחיפה מעל הראש ויציבות ליבה.', sets: 3, reps: 8, weight: 30, gif: 'znQUdHY.gif' },
  { name: 'חתירת כתף אחורית בכבל', category: 'shoulders', description: 'שכמות וכתף אחורית לתמיכה בחתירה וביציבה.', sets: 3, reps: 12, weight: 15, gif: 'ZfyAGhK.gif' },
  { name: 'הרחקות כתפיים', category: 'shoulders', description: 'חיזוק כתף צידית בשליטה.', sets: 3, reps: 12, weight: 7, gif: 'DsgkuIt.gif' },
  { name: 'כפיפות מרפקים', category: 'shoulders', description: 'חיזוק זרוע קדמית כתוספת למשיכות.', sets: 2, reps: 12, weight: 8, gif: 'NbVPDMW.gif' },
  { name: 'Pallof Press', category: 'core', description: 'ליבה אנטי־רוטציונית ויציבות בעמידה.', sets: 3, reps: 10, weight: 12, gif: '9pa4H5m.gif' },
  { name: 'סיבוב בכבל', category: 'core', description: 'ליבה ושליטה בסיבוב הגוף.', sets: 3, reps: 12, weight: 12.5, gif: 'aVs3BR3.gif' },
  { name: 'בטן', category: 'core', description: 'סבולת ליבה ושליטה באגן.', sets: 3, reps: 15, weight: 0, gif: '2gPfomN.gif' },
];

function PlansScreen({ plans, selectedPlan, selectedPlanId, setSelectedPlanId, editing, setEditing, updateExercise, updateRunPlan, removeExercise, moveExercise, renameExercise, addExercise, deletePlan, generateComplementaryPlan, setScreen }: {
  plans: Plan[]; selectedPlan: Plan; selectedPlanId: number; setSelectedPlanId: (id: number) => void; editing: boolean; setEditing: (value: boolean) => void;
  updateExercise: (id: number, field: 'sets' | 'reps' | 'weight', delta: number) => void; updateRunPlan: (field: 'distanceKm' | 'targetPace', value: number | string) => void; removeExercise: (id: number) => void; moveExercise: (id: number, direction: -1 | 1) => void; renameExercise: (id: number, name: string) => void; addExercise: (exercise: Omit<Exercise, 'id'>) => void; deletePlan: (id: number) => void; generateComplementaryPlan: () => void; setScreen: (screen: Screen) => void;
}) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState(3);
  const [newExerciseReps, setNewExerciseReps] = useState(8);
  const [newExerciseWeight, setNewExerciseWeight] = useState(0);
  const [pickedSuggestion, setPickedSuggestion] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('all');
  const [galleryPage, setGalleryPage] = useState(0);
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  useEffect(() => setDeletePendingId(null), [selectedPlanId]);
  const galleryItems = recommendedExercises.filter((item) => galleryCategory === 'all' || item.category === galleryCategory);
  const galleryPages = Math.ceil(galleryItems.length / 6);
  const visibleGalleryItems = galleryItems.slice(galleryPage * 6, galleryPage * 6 + 6);
  function chooseSuggestion(suggestion: typeof recommendedExercises[number]) {
    setPickedSuggestion(suggestion.name); setNewExerciseName(suggestion.name); setNewExerciseSets(suggestion.sets); setNewExerciseReps(suggestion.reps); setNewExerciseWeight(suggestion.weight);
  }
  function submitExercise() {
    const name = newExerciseName.trim();
    if (!name) return;
    addExercise({ name, sets: newExerciseSets, reps: newExerciseReps, weight: newExerciseWeight });
    setNewExerciseName(''); setNewExerciseSets(3); setNewExerciseReps(8); setNewExerciseWeight(0); setPickedSuggestion(''); setShowAddExercise(false);
  }
  return <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
    <aside className="space-y-3">
      <div className="flex items-center justify-between px-1"><p className="text-sm font-bold">התוכניות שלי</p><button onClick={() => setScreen('new-plan')} className="flex items-center gap-1 text-xs font-semibold text-primary"><Plus size={15} />תוכנית חדשה</button></div>
      {plans.map((plan) => <button key={plan.id} onClick={() => setSelectedPlanId(plan.id)} className={`w-full rounded-2xl border p-4 text-right transition ${selectedPlanId === plan.id ? 'border-primary/50 bg-primary/9' : 'border-border bg-card'}`}><div className="flex items-start justify-between"><div className="min-w-0"><strong className="block truncate">{plan.name}</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{plan.subtitle}</span></div><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${plan.accent === 'lime' ? 'bg-primary' : plan.accent === 'blue' ? 'bg-blue-400' : plan.accent === 'orange' ? 'bg-orange-400' : 'bg-cyan-400'}`} /></div></button>)}
      <Card className="border-border/70 bg-[linear-gradient(145deg,#123944,#0a252d)] p-4 text-white"><div className="flex items-center gap-3"><Waves className="text-cyan-300" size={21} /><div><p className="text-sm font-bold">מותאם לגלישה</p><p className="mt-0.5 text-xs text-cyan-50/60">התוכנית תתקצר אחרי סשן בים</p></div></div></Card>
    </aside>

    <section>
      <Card className="overflow-hidden border-border/70 bg-card p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-5"><div><p className="text-xs text-muted-foreground">תוכנית פעילה</p><h2 className="mt-1 text-2xl font-bold">{selectedPlan.name}</h2></div><div className="flex flex-wrap justify-end gap-2"><button onClick={generateComplementaryPlan} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><Sparkles size={15} />אימון משלים</button><button onClick={() => { if (deletePendingId === selectedPlan.id) { deletePlan(selectedPlan.id); setDeletePendingId(null); } else { setDeletePendingId(selectedPlan.id); } }} disabled={plans.length <= 1} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${deletePendingId === selectedPlan.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-400/10 text-red-400 hover:bg-red-400/20'}`} aria-label={deletePendingId === selectedPlan.id ? `אישור מחיקת ${selectedPlan.name}` : `מחיקת ${selectedPlan.name}`}><Trash2 size={15} />{deletePendingId === selectedPlan.id ? 'לחץ שוב למחיקה' : 'מחיקה'}</button><button onClick={() => setEditing(!editing)} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-semibold">{editing ? <Save size={16} /> : <Pencil size={16} />}{editing ? 'שמירה' : 'עריכה'}</button></div></div>
        <div className="p-4 sm:p-5">{selectedPlan.kind === 'run' ? <RunPlanEditor plan={selectedPlan} updateRunPlan={updateRunPlan} /> : <>
          <div className="mb-3 hidden grid-cols-[58px_1fr_100px_100px_110px_34px] gap-2 px-2 text-xs text-muted-foreground sm:grid"><span className="text-center">סדר</span><span>תרגיל</span><span className="text-center">סטים</span><span className="text-center">חזרות</span><span className="text-center">משקל</span><span /></div>
          <div className="space-y-2">{selectedPlan.exercises.map((exercise, index) => <EditableExercise key={exercise.id} exercise={exercise} index={index} total={selectedPlan.exercises.length} editing={editing} updateExercise={updateExercise} removeExercise={removeExercise} moveExercise={moveExercise} renameExercise={renameExercise} />)}</div>
          {editing && <button onClick={() => setShowAddExercise(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm font-semibold text-primary"><Plus size={17} />הוספת תרגיל</button>}
          <Button onClick={() => setScreen('choose')} size="lg" className="mt-5 h-14 w-full rounded-2xl text-base font-bold"><Dumbbell className="ml-2" />התחלת {selectedPlan.name}</Button></>}
        </div>
      </Card>
      {showAddExercise && <Card className="mt-4 border-primary/35 bg-card p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">תרגיל חדש ב־{selectedPlan.name}</p><h3 className="mt-1 text-xl font-bold">הוספת תרגיל</h3></div><button onClick={() => setShowAddExercise(false)} className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold">סגירה</button></div><div className="mt-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-bold">גלריית תרגילים · {recommendedExercises.length} אפשרויות</p><p className="mt-0.5 text-[11px] text-muted-foreground">בחר תרגיל כדי למלא את ערכי הפתיחה</p></div><Waves size={19} className="text-cyan-400" /></div><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{[{ id: 'all', label: 'הכול' }, { id: 'legs', label: 'רגליים' }, { id: 'hinge', label: 'ירך אחורית' }, { id: 'pull', label: 'משיכה' }, { id: 'push', label: 'דחיפה' }, { id: 'shoulders', label: 'כתפיים' }, { id: 'core', label: 'ליבה' }].map((category) => <button key={category.id} onClick={() => { setGalleryCategory(category.id); setGalleryPage(0); }} className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold ${galleryCategory === category.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{category.label}</button>)}</div><div className="grid gap-2 sm:grid-cols-2">{visibleGalleryItems.map((suggestion) => <button key={suggestion.name} onClick={() => chooseSuggestion(suggestion)} className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition ${pickedSuggestion === suggestion.name ? 'border-primary bg-primary/8' : 'border-border bg-muted/25 hover:border-primary/40'}`}><img src={`https://raw.githubusercontent.com/mohamedatef90/exercise-library/main/gifs/${suggestion.gif}`} alt={`הדגמת ${suggestion.name}`} className="h-16 w-16 shrink-0 rounded-xl bg-white/90 object-cover" /><div className="min-w-0"><strong className="text-sm">{suggestion.name}</strong><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{suggestion.description}</p><p className="mt-1 text-[10px] font-semibold text-primary">{suggestion.sets} סטים × {suggestion.reps}{suggestion.weight ? ` · ${suggestion.weight} ק״ג` : ' · משקל גוף'}</p></div></button>)}</div>{galleryPages > 1 && <div className="mt-3 flex items-center justify-between"><button onClick={() => setGalleryPage((page) => Math.max(0, page - 1))} disabled={galleryPage === 0} className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold disabled:opacity-35">הקודם</button><span className="text-[11px] text-muted-foreground">עמוד {galleryPage + 1} מתוך {galleryPages}</span><button onClick={() => setGalleryPage((page) => Math.min(galleryPages - 1, page + 1))} disabled={galleryPage >= galleryPages - 1} className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold disabled:opacity-35">הבא</button></div>}</div><div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" />או הוספה ידנית<span className="h-px flex-1 bg-border" /></div><div className="space-y-4"><label className="block text-sm font-semibold">שם התרגיל<Input value={newExerciseName} onChange={(event) => { setNewExerciseName(event.target.value); setPickedSuggestion(''); }} onKeyDown={(event) => { if (event.key === 'Enter') submitExercise(); }} placeholder="למשל: לחיצת חזה בדאמבלים" className="mt-2 h-12 bg-muted/45" /></label><div className="grid grid-cols-3 gap-3"><label className="text-sm font-semibold">סטים<Input type="number" min="1" value={newExerciseSets} onChange={(event) => setNewExerciseSets(Math.max(1, Number(event.target.value)))} className="mt-2 h-12 bg-muted/45" /></label><label className="text-sm font-semibold">חזרות<Input type="number" min="1" value={newExerciseReps} onChange={(event) => setNewExerciseReps(Math.max(1, Number(event.target.value)))} className="mt-2 h-12 bg-muted/45" /></label><label className="text-sm font-semibold">משקל ק״ג<Input type="number" min="0" step="0.5" value={newExerciseWeight} onChange={(event) => setNewExerciseWeight(Math.max(0, Number(event.target.value)))} className="mt-2 h-12 bg-muted/45" /></label></div><Button onClick={submitExercise} disabled={!newExerciseName.trim()} className="h-13 w-full font-bold"><Plus className="ml-2" size={18} />הוספה לתוכנית</Button></div></Card>}
    </section>
  </div>;
}

function RunPlanEditor({ plan, updateRunPlan }: { plan: Plan; updateRunPlan: (field: 'distanceKm' | 'targetPace', value: number | string) => void }) {
  const duration = Math.round((plan.distanceKm ?? 5.5) * 5.75);
  return <div><div className="rounded-2xl bg-[linear-gradient(145deg,#3b2415,#24170f)] p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-orange-200/60">אימון ריצה מותאם</p><h3 className="mt-1 text-2xl font-bold">ריצת {plan.distanceKm} ק״מ</h3></div><span className="rounded-xl bg-orange-400/15 p-3 text-orange-400"><Footprints size={24} /></span></div><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-black/15 p-3 text-center"><p className="text-[11px] text-orange-100/50">מרחק</p><strong className="mt-1 block">{plan.distanceKm} ק״מ</strong></div><div className="rounded-xl bg-black/15 p-3 text-center"><p className="text-[11px] text-orange-100/50">קצב יעד</p><strong className="mt-1 block">{plan.targetPace}</strong></div><div className="rounded-xl bg-black/15 p-3 text-center"><p className="text-[11px] text-orange-100/50">זמן משוער</p><strong className="mt-1 block">{duration} דק׳</strong></div></div></div><div className="mt-5 grid grid-cols-2 gap-4"><label className="text-sm font-semibold">מרחק בק״מ<Input type="number" min="1" max="50" step="0.5" value={plan.distanceKm} onChange={(event) => updateRunPlan('distanceKm', Number(event.target.value))} className="mt-2 h-12 bg-muted/45" /></label><label className="text-sm font-semibold">קצב יעד לק״מ<Input value={plan.targetPace} onChange={(event) => updateRunPlan('targetPace', event.target.value)} className="mt-2 h-12 bg-muted/45" /></label></div><div className="mt-4 rounded-xl bg-muted/45 p-3 text-xs leading-5 text-muted-foreground">חימום 5 דקות · ריצה בקצב נוח · שחרור 5 דקות. המרחק והקצב ניתנים לשינוי בכל אימון.</div><Button className="mt-5 h-14 w-full rounded-2xl bg-orange-400 text-base font-bold text-stone-950 hover:bg-orange-300"><Footprints className="ml-2" />התחלת ריצה</Button></div>;
}

function EditableExercise({ exercise, index, total, editing, updateExercise, removeExercise, moveExercise, renameExercise }: { exercise: Exercise; index: number; total: number; editing: boolean; updateExercise: (id: number, field: 'sets' | 'reps' | 'weight', delta: number) => void; removeExercise: (id: number) => void; moveExercise: (id: number, direction: -1 | 1) => void; renameExercise: (id: number, name: string) => void }) {
  return <div className="grid grid-cols-[58px_1fr_auto] items-center gap-2 rounded-2xl bg-muted/45 p-3 sm:grid-cols-[58px_1fr_100px_100px_110px_34px]">
    <div className="flex items-center justify-center gap-1 text-muted-foreground">{editing ? <><button onClick={() => moveExercise(exercise.id, -1)} disabled={index === 0} className="rounded-lg bg-card p-1.5 disabled:opacity-25" aria-label={`העברת ${exercise.name} למעלה`}><ArrowUp size={14} /></button><button onClick={() => moveExercise(exercise.id, 1)} disabled={index === total - 1} className="rounded-lg bg-card p-1.5 disabled:opacity-25" aria-label={`העברת ${exercise.name} למטה`}><ArrowDown size={14} /></button></> : <span className="text-xs font-bold">{index + 1}</span>}</div>
    <div className="min-w-0">{editing ? <Input aria-label={`שם התרגיל ${index + 1}`} value={exercise.name} onChange={(event) => renameExercise(exercise.id, event.target.value)} className="h-9 border-transparent bg-card font-semibold focus-visible:border-primary" /> : <p className="truncate font-semibold">{exercise.name}</p>}<p className="mt-0.5 text-[11px] text-muted-foreground sm:hidden">{exercise.sets} סטים · {exercise.reps} חזרות · {exercise.weight ? `${exercise.weight} ק״ג` : 'משקל גוף'}</p></div>
    <div className="hidden sm:block"><MiniStepper value={exercise.sets} onMinus={() => updateExercise(exercise.id, 'sets', -1)} onPlus={() => updateExercise(exercise.id, 'sets', 1)} disabled={!editing} /></div>
    <div className="hidden sm:block"><MiniStepper value={exercise.reps} onMinus={() => updateExercise(exercise.id, 'reps', -1)} onPlus={() => updateExercise(exercise.id, 'reps', 1)} disabled={!editing} /></div>
    <div className="hidden sm:block"><MiniStepper value={exercise.weight ?? 0} suffix="ק״ג" onMinus={() => updateExercise(exercise.id, 'weight', -2.5)} onPlus={() => updateExercise(exercise.id, 'weight', 2.5)} disabled={!editing} /></div>
    {editing ? <button onClick={() => removeExercise(exercise.id)} className="text-muted-foreground hover:text-red-400" aria-label="מחיקת תרגיל"><Trash2 size={17} /></button> : <span />}
  </div>;
}

function ChooseScreen({ plan, onChoose }: { plan: Plan; onChoose: (id: number) => void }) {
  return <div className="mx-auto max-w-2xl"><div className="mb-6"><p className="text-sm text-muted-foreground">{plan.name}</p><h2 className="mt-1 text-3xl font-bold">מאיפה מתחילים היום?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">אפשר להתחיל מכל תרגיל. שאר התוכנית תישאר זמינה וניתן לדלג ביניהם בזמן האימון.</p><a href="https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP" target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[#1ed760]/35 bg-[#1ed760]/10 p-4 text-right transition hover:border-[#1ed760]/70 hover:bg-[#1ed760]/15" aria-label="פתיחת מוזיקה לאימון ב-Spotify"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1ed760] text-black"><Music2 size={22} /></span><div><strong className="block">מוזיקה לאימון</strong><span className="mt-1 block text-xs text-muted-foreground">Spotify · Beast Mode</span></div></div><ExternalLink size={18} className="text-[#1ed760]" /></a></div><div className="space-y-3">{plan.exercises.map((exercise, index) => <button key={exercise.id} onClick={() => onChoose(exercise.id)} className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-right transition hover:border-primary/50 hover:bg-primary/5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground">{index + 1}</span><div><strong className="block">{exercise.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{exercise.sets} × {exercise.reps} · {exercise.weight ? `${exercise.weight} ק״ג` : 'משקל גוף'}</span></div></div><ChevronLeft className="text-muted-foreground" size={18} /></button>)}</div></div>;
}

const exerciseGuides: Record<string, { search: string; gif?: string; cues: string[] }> = {
  'סקוואט': { search: 'barbell back squat proper form', gif: 'qXTaZnJ.gif', cues: ['כפות רגליים יציבות וברכיים בקו האצבעות', 'שאיפה וברייס לפני הירידה; שמור גב ניטרלי', 'רד לעומק נשלט ודחוף את הרצפה בעלייה'] },
  'לחיצת חזה במוט': { search: 'barbell bench press proper form', gif: 'EIeI8Vf.gif', cues: ['שכמות לאחור ולמטה וכפות רגליים יציבות', 'הורד את המוט בשליטה לאזור אמצע החזה', 'מרפקים בזווית נוחה — לא פתוחים לגמרי לצדדים'] },
  'מתח': { search: 'pull up proper form', gif: 'lBDjFxJ.gif', cues: ['התחל מתלייה פעילה והרחיק כתפיים מהאוזניים', 'משוך חזה לכיוון המוט בלי תנופה', 'רד בשליטה עד יישור מלא שנשאר יציב'] },
  "לאנג׳ / ספליט סקוואט": { search: 'split squat proper form', gif: 'HBYyX94.gif', cues: ['עמידה ארוכה ויציבה; רוב העומס על הרגל הקדמית', 'הברך נעה בקו כף הרגל', 'רד ישר מטה ודחוף דרך מרכז כף הרגל'] },
  'חתירה הפוכה': { search: 'inverted row proper form', gif: '4OaumBr.gif', cues: ['שמור קו ישר מהראש לעקבים', 'משוך את החזה למוט וסגור שכמות', 'אל תרים כתפיים ואל תזרוק את הצוואר קדימה'] },
  'הרחקות כתפיים': { search: 'dumbbell lateral raise proper form', gif: 'DsgkuIt.gif', cues: ['כיפוף קל במרפק ותנועה במישור מעט קדמי', 'הרם עד גובה כתף בלבד', 'בחר משקל שמאפשר לבצע בלי תנופה'] },
  'כפיפות מרפקים': { search: 'dumbbell biceps curl proper form', gif: 'NbVPDMW.gif', cues: ['הצמד מרפקים לצדי הגוף', 'השלם טווח בלי להזיז את הכתף קדימה', 'הורד לאט ואל תשתמש בתנופה'] },
  'בטן': { search: 'abdominal bracing exercise proper form', gif: '2gPfomN.gif', cues: ['קרב צלעות לאגן ושמור גב ניטרלי', 'נשוף בזמן המאמץ בלי לאבד מתח', 'עצור כשאתה מתחיל לפצות בגב או בצוואר'] },
  'דדליפט': { search: 'barbell deadlift proper form', gif: 'ila4NZS.gif', cues: ['המוט מעל אמצע כף הרגל וקרוב לשוק', 'קח אוויר, חזק בטן והפעל את הרחב גבי', 'דחוף את הרצפה ושמור גב ניטרלי לכל אורך התנועה'] },
  'לחיצת כתפיים': { search: 'overhead press proper form', gif: 'znQUdHY.gif', cues: ['כווץ ישבן ובטן כדי למנוע קשת בגב', 'העבר את המוט בקו קרוב לפנים', 'סיים כשהמוט מעל מרכז הגוף בלי למשוך כתפיים לאוזניים'] },
  'חתירה במכונה': { search: 'seated machine row proper form', gif: '7I6LNUG.gif', cues: ['ייצב את החזה והגו', 'משוך מרפקים לאחור וסגור שכמות', 'חזור לאט בלי לעגל את הגב'] },
  'Box Jump': { search: 'box jump proper landing form', gif: 'iPm26QU.gif', cues: ['קפוץ לגובה שאתה יכול לנחות עליו בשקט', 'נחות עם ברכיים בקו האצבעות', 'עמוד לגמרי ואז רד מהקופסה בצעד — לא בקפיצה'] },
  'Single Leg RDL': { search: 'single leg romanian deadlift proper form', gif: 'gKozT8X.gif', cues: ['שמור אגן פונה לרצפה וברך תומכת מעט כפופה', 'שלח את האגן לאחור ושמור גב ארוך', 'עצור כשהאגן מתחיל להסתובב'] },
  'Pallof Press': { search: 'pallof press proper form', gif: '9pa4H5m.gif', cues: ['צלעות מטה ואגן ניטרלי', 'לחץ את הידיים קדימה בלי להסתובב', 'שמור נשימה ומתח אחיד לאורך הסט'] },
  'גובלט סקוואט': { search: 'dumbbell goblet squat proper form', gif: 'yn8yg1r.gif', cues: ['החזק את המשקולת קרוב לחזה', 'שמור כפות רגליים יציבות וברכיים בקו האצבעות', 'רד בשליטה ודחוף דרך מרכז כף הרגל'] },
  'דדליפט רומני': { search: 'barbell romanian deadlift proper form', gif: 'wQ2c4XD.gif', cues: ['שלח אגן לאחור עם ברכיים מעט כפופות', 'שמור את המוט קרוב לרגליים ואת הגב ניטרלי', 'עצור כשמורגשת מתיחה בהמסטרינג בלי לאבד מנח'] },
  'חתירת כתף אחורית בכבל': { search: 'cable rear delt row proper form', gif: 'ZfyAGhK.gif', cues: ['ייצב את הגו ושמור כתפיים רחוק מהאוזניים', 'משוך את החבל לכיוון הפנים והפרד ידיים', 'חזור לאט בלי לאבד שליטה בשכמות'] },
  'פולי עליון': { search: 'neutral grip lat pulldown proper form', gif: 'rkg41Fb.gif', cues: ['הרם חזה קלות ושמור אגן יציב', 'משוך מרפקים מטה לכיוון הצלעות', 'אל תמשוך מאחורי הראש ואל תשתמש בתנופה'] },
  'שכיבות סמיכה': { search: 'push up proper form', gif: 'I4hDWkc.gif', cues: ['שמור קו ישר מהראש לעקבים', 'המרפקים נעים בזווית נוחה ולא פתוחים לגמרי', 'רד בשליטה ודחוף את הרצפה תוך שמירת ליבה חזקה'] },
  'סיבוב בכבל': { search: 'cable twist proper form', gif: 'aVs3BR3.gif', cues: ['עמוד יציב והתחל את הסיבוב מהגו', 'שמור אגן נשלט ולא תמשוך רק עם הידיים', 'חזור לאט והימנע מטווח שמכאיב בגב'] },
};

function guideForExercise(name: string) {
  return exerciseGuides[name] || { search: `${name} exercise proper form`, cues: ['בצע את התנועה בשליטה ובטווח שאינו מכאיב', 'שמור נשימה ומנח גוף יציב', 'אם הטכניקה נשברת, הורד משקל או עצור את הסט'] };
}

type WorkoutDraft = { weight: number; reps: number; sessionSets: number; note: string; timerMode: 'set' | 'rest'; phaseStartedAt: number; savedSets: Array<{ setId: string; setNumber: number; reps: number; weightKg: number; rpe: number; notes: string; performedAt: string; setDurationSec: number }> };
const REST_SECONDS = 90;
function formatDuration(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }

function WorkoutScreen({ workoutId, workoutStartedAt, plan, exercise, completedSets, setCompletedSets, rpe, setRpe, onSwitch, onNext }: { workoutId: string; workoutStartedAt: string; plan: Plan; exercise: Exercise; completedSets: number; setCompletedSets: (n: number) => void; rpe: number; setRpe: (n: number) => void; onSwitch: () => void; onNext: () => void }) {
  const [weight, setWeight] = useState(exercise.weight ?? 0);
  const [reps, setReps] = useState(exercise.reps);
  const [sessionSets, setSessionSets] = useState(exercise.sets);
  const [note, setNote] = useState('');
  const [timerMode, setTimerMode] = useState<'set' | 'rest'>('set');
  const [phaseStartedAt, setPhaseStartedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [savedSets, setSavedSets] = useState<WorkoutDraft['savedSets']>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSet, setLastSet] = useState<{ reps: number; weightKg: number; timestamp: string } | null>(null);
  const [historyState, setHistoryState] = useState<'loading' | 'found' | 'empty'>('loading');
  const guide = guideForExercise(exercise.name);
  const draftKey = `flowfit-workout-draft:${workoutId}:${exercise.id}`;
  const elapsedSeconds = Math.max(0, Math.floor((now - phaseStartedAt) / 1000));
  const restRemaining = Math.max(0, REST_SECONDS - elapsedSeconds);
  const effortChoices = [{ value: 4, emoji: '😄', label: 'קל' }, { value: 6, emoji: '🙂', label: 'נוח' }, { value: 7, emoji: '😐', label: 'בינוני' }, { value: 8, emoji: '😣', label: 'קשה' }, { value: 10, emoji: '🥵', label: 'מקסימלי' }];
  useEffect(() => {
    try { const saved = localStorage.getItem(draftKey); if (saved) { const draft = JSON.parse(saved) as WorkoutDraft; setWeight(draft.weight); setReps(draft.reps); setSessionSets(draft.sessionSets); setNote(draft.note || ''); setTimerMode(draft.timerMode || 'set'); setPhaseStartedAt(draft.phaseStartedAt || Date.now()); setSavedSets(draft.savedSets || []); setCompletedSets(draft.savedSets?.length || 0); } }
    catch { localStorage.removeItem(draftKey); }
    finally { setDraftReady(true); }
  }, [draftKey]);
  useEffect(() => { if (draftReady) localStorage.setItem(draftKey, JSON.stringify({ weight, reps, sessionSets, note, timerMode, phaseStartedAt, savedSets } satisfies WorkoutDraft)); }, [draftKey, draftReady, note, phaseStartedAt, reps, savedSets, sessionSets, timerMode, weight]);
  useEffect(() => { const interval = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(interval); }, []);
  useEffect(() => { if (timerMode === 'rest' && restRemaining === 0) { setTimerMode('set'); setPhaseStartedAt(Date.now()); } }, [restRemaining, timerMode]);
  useEffect(() => {
    let active = true;
    setHistoryState('loading');
    fetch('/api/sheets').then((response) => response.json() as Promise<{ ok: boolean; sets?: Array<{ planName: string; exerciseName: string; reps: string; weightKg: string; timestamp: string }> }>).then((data) => {
      if (!active) return;
      const latest = data.sets?.find((set) => set.exerciseName.trim() === exercise.name.trim() && set.planName.trim() === plan.name.trim()) || data.sets?.find((set) => set.exerciseName.trim() === exercise.name.trim());
      if (!latest) { setLastSet(null); setHistoryState('empty'); return; }
      const previous = { reps: Number(latest.reps) || exercise.reps, weightKg: Number(latest.weightKg) || 0, timestamp: latest.timestamp };
      setLastSet(previous); if (!localStorage.getItem(draftKey)) { setReps(previous.reps); if (exercise.weight !== null) setWeight(previous.weightKg); } setHistoryState('found');
    }).catch(() => { if (active) setHistoryState('empty'); });
    return () => { active = false; };
  }, [draftKey, exercise.name, exercise.reps, exercise.weight, plan.name]);
  async function saveSet() {
    const nextCompleted = Math.min(sessionSets, completedSets + 1);
    const performedAt = new Date().toISOString();
    const savedSet = { setId: crypto.randomUUID(), setNumber: nextCompleted, reps, weightKg: exercise.weight === null ? 0 : weight, rpe, notes: note, performedAt, setDurationSec: timerMode === 'set' ? elapsedSeconds : 0 };
    setSaveState('saving');
    try {
      const response = await fetch('/api/sheets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'saveSet', set: { ...savedSet, workoutId, workoutStartedAt, planId: plan.id, planName: plan.name, activityType: 'strength', exerciseId: exercise.id, exerciseName: exercise.name, source: 'FlowFit' } }) });
      const data = await response.json() as { ok: boolean };
      if (!data.ok) throw new Error();
      setCompletedSets(nextCompleted);
      setSavedSets((current) => [...current, savedSet]);
      setSaveState('saved');
      setNote('');
      setTimerMode('rest');
      setPhaseStartedAt(Date.now());
    } catch { setSaveState('error'); }
  }
  return <div className="mx-auto max-w-2xl"><Card className="overflow-hidden border-0 bg-card p-0 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
    <div className="bg-[linear-gradient(145deg,#153f49,#0a252d)] px-5 py-5 text-white">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs text-cyan-100/60">{plan.name} · תרגיל נוכחי</p><h2 className="mt-1 text-3xl font-bold">{exercise.name}</h2></div><div className="flex gap-2"><button onClick={onSwitch} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">החלפה</button><button onClick={onNext} className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">לתרגיל הבא<ChevronLeft size={15} /></button></div></div>
    </div>
    <div className="p-5">
      <details className="group mb-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5"><summary className="flex cursor-pointer list-none items-center gap-3 p-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/90">{guide.gif ? <img src={`https://raw.githubusercontent.com/mohamedatef90/exercise-library/main/gifs/${guide.gif}`} alt={`הדגמה של ${exercise.name}`} className="h-full w-full object-cover" /> : <Dumbbell className="m-4 text-cyan-700" size={24} />}</div><div className="min-w-0 flex-1"><p className="text-[11px] text-cyan-300">איך לבצע נכון</p><h3 className="truncate text-sm font-bold">דגשים ל־{exercise.name}</h3><p className="mt-1 text-[10px] text-muted-foreground">לחץ לפתיחת ההנחיות</p></div><ChevronLeft className="text-cyan-300 transition-transform group-open:-rotate-90" size={18} /></summary><div className="border-t border-cyan-400/10 px-4 pb-4 pt-3"><ul className="space-y-2 text-xs leading-5 text-muted-foreground">{guide.cues.map((cue) => <li key={cue} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{cue}</li>)}</ul><a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(guide.search)}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300">עוד הדגמות בתמונות<ExternalLink size={14} /></a><p className="mt-2 text-center text-[9px] text-muted-foreground">GIF: open-source exercise-library</p></div></details>
      <div className="mb-3 flex items-center justify-between rounded-xl bg-muted/45 px-3 py-2 text-xs"><span className="text-muted-foreground">הביצוע האחרון</span><strong>{historyState === 'loading' ? 'טוען…' : lastSet ? `${lastSet.weightKg} ק״ג × ${lastSet.reps} חזרות` : 'עדיין לא תועד'}</strong></div>
      <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><BigStepper label="משקל" value={weight} suffix="ק״ג" onMinus={() => setWeight(Math.max(0, weight - 2.5))} onPlus={() => setWeight(weight + 2.5)} /><span className="pt-6 text-xl text-muted-foreground">×</span><BigStepper label="חזרות" value={reps} onMinus={() => setReps(Math.max(1, reps - 1))} onPlus={() => setReps(reps + 1)} /></div>
      <div className="rounded-2xl border border-border/70 bg-muted/35 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-bold">מאמץ בסט הזה</p><p className="text-[11px] text-muted-foreground">בחר לפי ההרגשה — לא לפי מספר הסט</p></div><strong className="rounded-lg bg-primary/10 px-2 py-1 text-xs text-primary">RPE {rpe}</strong></div><div className="grid grid-cols-5 gap-1.5">{effortChoices.map((choice) => <button key={choice.value} type="button" onClick={() => setRpe(choice.value)} aria-pressed={rpe === choice.value} className={`rounded-xl border px-1 py-2 text-center transition ${rpe === choice.value ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 bg-card text-muted-foreground'}`}><span className="block text-xl" aria-hidden="true">{choice.emoji}</span><span className="mt-1 block text-[9px] font-semibold">{choice.label}</span></button>)}</div></div>
      <div className={`mt-5 flex items-center justify-between rounded-2xl border p-4 ${timerMode === 'rest' ? 'border-cyan-400/35 bg-cyan-400/5' : 'border-primary/30 bg-primary/5'}`}><div className="flex items-center gap-2"><Timer size={18} className={timerMode === 'rest' ? 'text-cyan-300' : 'text-primary'} /><div><p className="text-xs text-muted-foreground">{timerMode === 'rest' ? 'מנוחה בין סטים' : 'זמן הסט הנוכחי'}</p><strong className="text-2xl tabular-nums">{formatDuration(timerMode === 'rest' ? restRemaining : elapsedSeconds)}</strong></div></div>{timerMode === 'rest' && <button type="button" onClick={() => { setTimerMode('set'); setPhaseStartedAt(Date.now()); }} className="rounded-xl bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-300">התחלת הסט הבא</button>}</div>
      <Button onClick={saveSet} disabled={saveState === 'saving' || completedSets >= sessionSets || timerMode === 'rest'} className="mt-4 h-14 w-full rounded-2xl text-base font-bold"><Check className="ml-2" />{saveState === 'saving' ? 'שומר בגיליון…' : completedSets >= sessionSets ? 'כל הסטים נשמרו' : timerMode === 'rest' ? 'במנוחה — הסט הבא יתחיל מיד' : saveState === 'error' ? 'ניסיון שמירה נוסף' : 'שמירת סט והתחלת מנוחה'}</Button>
      <div className="mt-5 rounded-2xl bg-muted/35 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">התקדמות בתרגיל</p><strong className="text-sm">{completedSets} מתוך {sessionSets} סטים הושלמו</strong></div><div className="flex items-center rounded-lg bg-card"><button onClick={() => { setSessionSets(Math.max(1, sessionSets - 1)); setCompletedSets(Math.min(completedSets, Math.max(1, sessionSets - 1))); }} className="p-1.5 text-muted-foreground" aria-label="הסרת סט"><Minus size={14} /></button><button onClick={() => setSessionSets(sessionSets + 1)} className="p-1.5 text-muted-foreground" aria-label="הוספת סט"><Plus size={14} /></button></div></div><div className="mt-3 flex gap-2" aria-label={`${completedSets} מתוך ${sessionSets} סטים הושלמו`}>{Array.from({ length: sessionSets }, (_, index) => <span key={index} className={`flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-bold ${index < completedSets ? 'bg-primary text-primary-foreground' : index === completedSets ? 'border border-primary/60 bg-primary/10 text-primary' : 'bg-card text-muted-foreground'}`}>{index < completedSets ? <Check size={15} /> : index + 1}</span>)}</div></div>
      <div className="mt-5 space-y-2"><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="כתיבת הערה על התרגיל או הסט..." className="min-h-24 resize-none rounded-xl bg-muted/45" /><button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground"><Mic size={17} />הוספת הערה בקול</button></div>
    </div>
  </Card></div>;
}

function MiniStepper({ value, suffix, onMinus, onPlus, disabled }: { value: number; suffix?: string; onMinus: () => void; onPlus: () => void; disabled: boolean }) { return <div className="flex items-center justify-between rounded-xl bg-card p-1"><button disabled={disabled} onClick={onMinus} className="p-1 text-muted-foreground disabled:opacity-0"><Minus size={14} /></button><span className="text-xs font-bold">{value}{suffix && <small className="mr-1 font-normal text-muted-foreground">{suffix}</small>}</span><button disabled={disabled} onClick={onPlus} className="p-1 text-muted-foreground disabled:opacity-0"><Plus size={14} /></button></div>; }
function BigStepper({ label, value, suffix, onMinus, onPlus }: { label: string; value: number; suffix?: string; onMinus: () => void; onPlus: () => void }) { return <div><p className="mb-2 text-center text-xs text-muted-foreground">{label}</p><div className="flex items-center justify-between rounded-2xl bg-muted/70 p-1.5"><button onClick={onMinus} className="rounded-xl bg-card p-2"><Minus size={18} /></button><div><strong className="text-xl">{value}</strong>{suffix && <small className="mr-1 text-xs text-muted-foreground">{suffix}</small>}</div><button onClick={onPlus} className="rounded-xl bg-card p-2"><Plus size={18} /></button></div></div>; }
