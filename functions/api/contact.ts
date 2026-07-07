interface Env {
  RESEND_SEND_API_KEY: string;
}

const SITE_NAME = 'PMFlow';
const SITE_URL = 'https://pmflow.karmait.net';

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const apiKey = ctx.env.RESEND_SEND_API_KEY;
  if (!apiKey) {
    return Response.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
  }

  let body: FormData;
  try {
    body = await ctx.request.formData();
  } catch {
    return Response.json({ success: false, error: 'Invalid form data' }, { status: 400 });
  }

  const name    = String(body.get('name')    ?? '').trim();
  const email   = String(body.get('email')   ?? '').trim();
  const message = String(body.get('message') ?? '').trim();

  if (!name || !email || !message) {
    return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ success: false, error: 'Invalid email' }, { status: 400 });
  }

  const e = escHtml;

  const notifyHtml = `<!DOCTYPE html><html><head></head><body>
<p>${e(SITE_NAME)} (${e(SITE_URL)}) &#12362;&#21839;&#12356;&#21512;&#12431;&#12379;&#12501;&#12457;&#12540;&#12512;&#12363;&#12425;&#26032;&#12375;&#12356;&#12513;&#12483;&#12475;&#12540;&#12472;&#12364;&#23626;&#12365;&#12414;&#12375;&#12383;&#12290;</p>
<table style="border-collapse:collapse;margin-top:16px">
  <tr><td style="padding:4px 12px 4px 0;color:#888;white-space:nowrap">&#12362;&#21517;&#21069;</td><td style="padding:4px 0"><strong>${e(name)}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#888">&#12513;&#12540;&#12523;</td><td style="padding:4px 0"><a href="mailto:${e(email)}">${e(email)}</a></td></tr>
</table>
<hr style="margin:16px 0;border:none;border-top:1px solid #ddd"/>
<p style="white-space:pre-wrap">${e(message)}</p>
</body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from:     `${SITE_NAME.replace(/[<>]/g, '')} <noreply@karmait.net>`,
      to:       ['official@karmait.net'],
      reply_to: email,
      subject:  `[${SITE_NAME}] お問い合わせ（${name}）`,
      html:     notifyHtml,
    }),
  });

  if (!res.ok) {
    console.error('Resend error:', await res.text());
    return Response.json({ success: false, error: 'Mail send failed' }, { status: 500 });
  }

  return Response.json({ success: true });
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[^\x00-\x7F]/g, c => `&#${c.codePointAt(0)};`);
}
