// Email via Resend (https://resend.com)
// Install: npm install resend
// Add RESEND_API_KEY to .env.local

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send')
    console.log(`[email] Would send to ${to}: ${subject}`)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LaunchPad <noreply@launchpad.app>',
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[email] Resend error:', body)
  }
}

// ── Templates ────────────────────────────────────────────────

export async function sendApplicationConfirmationToStudent({
  studentName,
  studentEmail,
  listingTitle,
  companyName,
}: {
  studentName: string
  studentEmail: string
  listingTitle: string
  companyName: string
}) {
  await sendEmail({
    to: studentEmail,
    subject: `Application received — ${listingTitle} at ${companyName}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#0A1628">LaunchPad</span>
        </div>

        <h1 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#0A1628">
          Application received ✓
        </h1>
        <p style="color:#475569;margin-bottom:24px">
          Hi ${studentName}, we've received your application for the position below.
          The employer will reach out directly if you're selected to move forward.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="font-size:16px;font-weight:600;color:#0A1628;margin:0 0 4px">${listingTitle}</p>
          <p style="color:#64748b;margin:0">${companyName}</p>
        </div>

        <p style="color:#94a3b8;font-size:13px">
          Good luck! — The LaunchPad team
        </p>
      </div>
    `,
  })
}

export async function sendNewApplicationAlertToEmployer({
  employerEmail,
  studentName,
  studentEmail,
  studentSchool,
  studentMajor,
  listingTitle,
  listingId,
  applicationId,
}: {
  employerEmail: string
  studentName: string
  studentEmail: string
  studentSchool: string | null
  studentMajor: string | null
  listingTitle: string
  listingId: string
  applicationId: string
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/listings/${listingId}/applicants`

  await sendEmail({
    to: employerEmail,
    subject: `New application — ${studentName} applied to ${listingTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#0A1628">LaunchPad</span>
        </div>

        <h1 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#0A1628">
          New application received
        </h1>
        <p style="color:#475569;margin-bottom:24px">
          A student just applied to <strong>${listingTitle}</strong>.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#64748b;padding:4px 0;width:100px">Name</td><td style="font-weight:600;color:#0A1628">${studentName}</td></tr>
            <tr><td style="color:#64748b;padding:4px 0">Email</td><td><a href="mailto:${studentEmail}" style="color:#3b82f6">${studentEmail}</a></td></tr>
            ${studentSchool ? `<tr><td style="color:#64748b;padding:4px 0">School</td><td style="color:#0A1628">${studentSchool}</td></tr>` : ''}
            ${studentMajor ? `<tr><td style="color:#64748b;padding:4px 0">Major</td><td style="color:#0A1628">${studentMajor}</td></tr>` : ''}
          </table>
        </div>

        <a href="${dashboardUrl}"
          style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View Application →
        </a>

        <p style="color:#94a3b8;font-size:13px;margin-top:24px">
          Manage all applicants in your LaunchPad dashboard.
        </p>
      </div>
    `,
  })
}
