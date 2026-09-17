import { env } from 'cloudflare:workers';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

async function recentSets() {
  if (!env.GOOGLE_SHEETS_ENDPOINT || !env.GOOGLE_SHEETS_SECRET) return [];
  const response = await fetch(env.GOOGLE_SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'getRecentSets', limit: 60, secret: env.GOOGLE_SHEETS_SECRET }),
    redirect: 'follow',
  });
  const data = await response.json() as { sets?: unknown[] };
  return data.sets || [];
}

export async function POST(request: Request) {
  if (!env.OPENAI_API_KEY) return Response.json({ ok: false, error: 'ai_not_configured' }, { status: 503 });
  const body = await request.json() as { message?: string; messages?: ChatMessage[]; plans?: unknown[]; plannedActivities?: unknown[]; garmin?: unknown };
  const message = String(body.message || '').trim().slice(0, 1200);
  if (!message) return Response.json({ ok: false, error: 'message_required' }, { status: 400 });

  try {
    const sets = await recentSets();
    const context = JSON.stringify({ plans: body.plans || [], plannedActivities: body.plannedActivities || [], recentSets: sets, garminSummary: body.garmin || null }).slice(0, 24000);
    const history = (body.messages || []).slice(-8).map((item) => ({ role: item.role, content: String(item.content).slice(0, 1200) }));
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        store: false,
        max_output_tokens: 700,
        instructions: 'אתה מאמן הכושר האישי של FlowFit. ענה בעברית קצרה, פרקטית וחמה. המטרה היא לתעדף גלישה כשיש גלים או כשהמשתמש תכנן גלישה, תוך שמירה על התקדמות כוח ועל לפחות ריצה אחת בכל 7 ימים. נתח את התכנון העתידי, האימונים האחרונים, התוכניות ומדדי Garmin. המלץ מה לבצע היום ומחר והסבר אילו נתונים גרמו להמלצה. הצע שינוי תרגיל, משקל, חזרות או נפח רק כשיש סיבה ברורה. אם חסר תרגיל מתאים, הסבר את הפער והצע להוסיף אותו לבנק התרגילים הקבוע — לעולם לא כתרגיל חד־פעמי. התייחס לעומס, איזון קבוצות שרירים ו-RPE. אל תאבחן מצבים רפואיים; בכאב חד, סחרחורת או פציעה המלץ לעצור ולהתייעץ עם איש מקצוע. ציין כשחסר מידע ואל תמציא נתונים.',
        input: [...history, { role: 'user', content: `נתוני FlowFit העדכניים:\n${context}\n\nהשאלה שלי: ${message}` }],
      }),
    });
    const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
    if (!response.ok) return Response.json({ ok: false, error: data.error?.message || 'ai_request_failed' }, { status: response.status });
    const answer = data.output_text || data.output?.flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text || '').join('\n').trim();
    if (!answer) throw new Error('empty_ai_response');
    return Response.json({ ok: true, answer });
  } catch {
    return Response.json({ ok: false, error: 'coach_unavailable' }, { status: 502 });
  }
}
