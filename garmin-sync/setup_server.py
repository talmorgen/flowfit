#!/usr/bin/env python3
"""One-time localhost setup UI for the FlowFit Garmin sync."""

from html import escape
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs

import sync
from garminconnect import Garmin


PAGE = """<!doctype html><html lang='he' dir='rtl'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>FlowFit · Garmin</title><style>body{margin:0;background:#031515;color:#f4faf8;font-family:Arial,sans-serif}.card{max-width:520px;margin:7vh auto;padding:28px;background:#0b2525;border:1px solid #214343;border-radius:24px}h1{margin:0 0 8px}p{color:#a8bbbb;line-height:1.6}label{display:block;margin:18px 0 6px;font-weight:700}input{box-sizing:border-box;width:100%;padding:14px;border-radius:12px;border:1px solid #315151;background:#061b1b;color:white;font-size:16px}button{width:100%;margin-top:24px;padding:15px;border:0;border-radius:14px;background:#d9ff3f;color:#071313;font-size:17px;font-weight:800}button:disabled{opacity:.55}.note{font-size:13px}.error{color:#ff9b9b}.ok{color:#d9ff3f}</style><main class='card'><h1>חיבור Garmin ל־FlowFit</h1><p>הפרטים נשלחים ישירות מהמחשב אל Garmin. הסיסמה וקוד האימות אינם נשמרים.</p>{message}<form method='post' onsubmit="const b=this.querySelector('button');b.disabled=true;b.textContent='מתחבר ומסנכרן…';"><label>Garmin email</label><input name='email' type='email' required autocomplete='username'><label>Garmin password</label><input name='password' type='password' required autocomplete='current-password'><label>קוד MFA נוכחי (אם מופעל)</label><input name='mfa' inputmode='numeric' autocomplete='one-time-code'><label>FlowFit secret</label><input name='secret' type='password' required><label>כמה ימים לסנכרן</label><input name='days' type='number' min='1' max='90' value='14'><button>התחברות וסנכרון</button></form><p class='note'>זהו מסך מקומי ב־127.0.0.1. אפשר לסגור אותו לאחר הודעת ההצלחה.</p></main></html>"""


class Handler(BaseHTTPRequestHandler):
    def render(self, message: str = "") -> None:
        body = PAGE.replace("{message}", message).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        self.render()

    def do_POST(self) -> None:
        try:
            size = int(self.headers.get("Content-Length", "0"))
            form = {key: values[0] for key, values in parse_qs(self.rfile.read(size).decode()).items()}
            config = sync.load_config()
            mfa = form.get("mfa", "").strip()
            client = Garmin(form["email"], form["password"], prompt_mfa=lambda: mfa, retry_attempts=1)
            sync.TOKEN_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
            client.login(str(sync.TOKEN_DIR))
            days = max(1, min(90, int(form.get("days", "14"))))
            end = sync.date.today()
            start = end - sync.timedelta(days=days - 1)
            activities = [sync.normalize_activity(item) for item in client.get_activities_by_date(start.isoformat(), end.isoformat())]
            health = [sync.normalize_health(client, start + sync.timedelta(days=offset)) for offset in range(days)]
            result = sync.post(config["endpoint"], form["secret"], {"action": "syncGarmin", "activities": activities, "health": health})
            sync.save_config({**config, "garmin_email": form["email"]})
            self.render(f"<p class='ok'>הסנכרון הצליח: {result['activities']} פעילויות ו־{result['healthDays']} ימי בריאות.</p>")
        except Exception as error:
            self.render(f"<p class='error'>החיבור נכשל: {escape(str(error))}</p>")

    def log_message(self, *_args) -> None:
        return


if __name__ == "__main__":
    print("FlowFit Garmin setup: http://127.0.0.1:8767")
    ThreadingHTTPServer(("127.0.0.1", 8767), Handler).serve_forever()
