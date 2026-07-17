export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function fromAddress(email: string): string {
  return `chloemusic® <${email}>`;
}

export function buildConfirmEmail(confirmUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const safeUrl = escapeHtml(confirmUrl);
  return {
    subject: `Confirm your subscription to downloadmorebass.com`,
    html: `<!DOCTYPE html>
<html>
  <body style="margin: 0; padding: 24px 12px; background: #f0f0f0; font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.5;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center">
          <p style="width: 100%; max-width: 420px; margin: 0 0 16px; text-align: left; font-size: 14px; color: #222;">Thank you for subscribing to downloadmorebass.com</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 420px; background: #fff; border: 1px solid #ccc;">
            <tr>
              <td style="padding: 20px 24px; text-align: center;">
                <p style="margin: 0 0 16px; font-size: 14px;">Confirm to get notified when new tracks drop, news and more!</p>
                <p style="margin: 0 0 16px; font-size: 13px; color: #666;">Your attention is greatly appreciated and updates will be hand crafted and meaningful.</p>
                <p style="margin: 0 0 16px;">
                  <a href="${safeUrl}" style="display: inline-block; border: 1px solid #999; background: #eee; color: #222; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; text-decoration: none; padding: 8px 14px;">Yes, I want to subscribe</a>
                </p>
                <p style="margin: 0; color: #666; font-size: 12px;">If you did not request this, you can ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: `Confirm your subscription to get notified when new songs drop on downloadmorebass.\n\n${confirmUrl}\n\nIf you did not request this, you can ignore this email.`,
  };
}

export function buildAnnounceEmail(options: {
  title: string;
  message: string;
  url: string;
  unsubscribeUrl: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const title = stripNewlines(options.title);
  const message = stripNewlines(options.message);
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeUrl = escapeHtml(options.url);
  const safeUnsubscribe = escapeHtml(options.unsubscribeUrl);

  const messageBlock = message ? `<p>${safeMessage}</p>` : "";
  const messageText = message ? `\n\n${message}` : "";

  return {
    subject: stripNewlines(`New track: ${title}`),
    html: `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
    <p>New track: <strong>${safeTitle}</strong></p>
    ${messageBlock}
    <p><a href="${safeUrl}">Listen here</a></p>
    <p style="color: #666; font-size: 12px; margin-top: 2rem;">
      <a href="${safeUnsubscribe}">Unsubscribe</a>
    </p>
  </body>
</html>`,
    text: `New track: ${title}${messageText}\n\nListen: ${options.url}\n\nUnsubscribe: ${options.unsubscribeUrl}`,
  };
}

export async function sendResendEmail(
  env: { RESEND_API_KEY: string; FROM_EMAIL: string },
  options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    headers?: Record<string, string>;
  },
): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(env.FROM_EMAIL),
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      headers: options.headers,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend error (${response.status}): ${body.slice(0, 300)}`);
    return false;
  }

  return true;
}
