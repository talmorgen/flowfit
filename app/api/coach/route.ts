import { env } from 'cloudflare:workers';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

async function recentSets() {
  try {
    const result = await env.DB.prepare('SELECT workout_id AS workoutId, workout_started_at AS workoutStartedAt, plan_name AS planName, exercise_name AS exerciseName, set_number AS setNumber, reps, weight_kg AS weightKg, rpe, performed_at AS performedAt, set_duration_sec AS setDurationSec FROM training_sets ORDER BY performed_at DESC LIMIT 100').all();
    if (result.results.length) return result.results;
  } catch { /* legacy fallback below */ }
  if (!env.GOOGLE_SHEETS_ENDPOINT || !env.GOOGLE_SHEETS_SECRET) return [];
  const response = await fetch(env.GOOGLE_SHEETS_ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getRecentSets', limit: 100, secret: env.GOOGLE_SHEETS_SECRET }), redirect: 'follow' });
  const data = await response.json() as { sets?: unknown[] };
  return data.sets || [];
}

function cleanAnswer(value: string) {
  return value.replace(/[*#_`>~]/g, '').replace(/^\s*[-•]\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

export async function POST(request: Request) {
  if (!env.OPENAI_API_KEY) return Response.json({ ok: false, error: 'ai_not_configured' }, { status: 503 });
  const body = await request.json() as { message?: string; messages?: ChatMessage[]; plans?: unknown[]; plannedActivities?: unknown[]; garmin?: unknown; decisionContext?: unknown };
  const message = String(body.message || '').trim().slice(0, 1200);
  if (!message) return Response.json({ ok: false, error: 'message_required' }, { status: 400 });

  try {
    const sets = await recentSets();
    const context = JSON.stringify({ plans: body.plans || [], plannedActivities: body.plannedActivities || [], recentSets: sets, garminSummary: body.garmin || null, currentDecision: body.decisionContext || null }).slice(0, 24000);
    const history = (body.messages || []).slice(-8).map((item) => ({ role: item.role, content: String(item.content).slice(0, 1200) }));
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        store: false,
        max_output_tokens: 350,
        instructions: 'אתה מאמן הכושר האישי של FlowFit. ענה בעברית טבעית, חמה ומאוד תמציתית: עד 5 משפטים קצרים ועד 90 מילים. החזר טקסט רגיל בלבד ללא Markdown, ללא כוכביות, ללא כותרות וללא סימני רשימה. לפני המלצה למחר, בדוק בפועל את פעילויות Garmin האחרונות, הסטים האחרונים ממסד הנתונים, RPE, שינה, מוכנות, עומס והתוכנית השבועית. ציין במשפט הראשון מה האימון או הפעילות האחרונים שמצאת ומתי היו. לאחר מכן קבע אם מתאים כוח, ריצה, גלישה או התאוששות. אם כוח מתאים, ציין תוכנית קיימת מדויקת. אם העומס האחרון גבוה, הצע התאמה קונקרטית בנפח, חזרות או משקל; לעולם אל תציע להפחית משקל בתרגיל משקל גוף. המטרה היא לתעדף גלישה כשיש גלים או כשהמשתמש תכנן גלישה, להתקדם בכוח ולשמור לפחות ריצה אחת בכל 7 ימים. אל תמציא נתונים. אם חסר מידע, אמור בדיוק מה חסר. אל תאבחן מצבים רפואיים.',
        input: [...history, { role: 'user', content: `נתוני FlowFit העדכניים:\n${context}\n\nהשאלה שלי: ${message}` }],
      }),
    });
    const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
    if (!response.ok) return Response.json({ ok: false, error: data.error?.message || 'ai_request_failed' }, { status: response.status });
    const answer = data.output_text || data.output?.flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text || '').join('\n').trim();
    if (!answer) throw new Error('empty_ai_response');
    return Response.json({ ok: true, answer: cleanAnswer(answer) });
  } catch {
    return Response.json({ ok: false, error: 'coach_unavailable' }, { status: 502 });
  }
}
