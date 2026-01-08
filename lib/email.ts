import { Resend } from "resend"

// Initialize Resend with API key (lazy initialization to avoid build errors)
let resend: Resend | null = null

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface SendPasswordResetEmailParams {
  email: string
  resetUrl: string
  userName?: string | null
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams) {
  const name = userName || "Director"
  const client = getResendClient()

  if (!client) {
    throw new Error("Email service not configured. RESEND_API_KEY is missing.")
  }

  try {
    const { data, error } = await client.emails.send({
      from: "SiteSync <onboarding@resend.dev>", // Use your verified domain in production
      to: email,
      subject: "Reset Your SiteSync Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏗️ SiteSync</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${name},</h2>
            
            <p>We received a request to reset your password for your SiteSync Director account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">This link will expire in <strong>1 hour</strong> for security reasons.</p>
            
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #f97316; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} SiteSync. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error(error.message)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}


// Delay notification email
interface SendDelayNotificationParams {
  email: string
  delay: {
    title: string
    category: string
    severity: string
    daysLost: number
    siteName: string
    createdBy: string
  }
}

const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    weather: "🌧️",
    materials: "📦",
    labor: "👷",
    permits: "📄",
    equipment: "🔧",
    access: "🚧",
    other: "⚠️",
  }
  return emojis[category] || "⚠️"
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    minor: "#eab308",
    moderate: "#f97316",
    major: "#dc2626",
  }
  return colors[severity] || "#f97316"
}

export async function sendDelayNotificationEmail({
  email,
  delay,
}: SendDelayNotificationParams) {
  const client = getResendClient()

  if (!client) {
    console.log("Email service not configured - skipping delay notification")
    return { success: false, reason: "Email service not configured" }
  }

  try {
    const { data, error } = await client.emails.send({
      from: "SiteSync <onboarding@resend.dev>",
      to: email,
      subject: `⚠️ New Delay Reported: ${delay.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${getSeverityColor(delay.severity)} 0%, #c2410c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏗️ SiteSync</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">⚠️ New Delay Alert</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; margin-top: 0;">${getCategoryEmoji(delay.category)} ${delay.title}</h2>
            
            <div style="background: #fef3c7; border-left: 4px solid ${getSeverityColor(delay.severity)}; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-weight: 600; color: #92400e;">
                ${delay.daysLost} day${delay.daysLost !== 1 ? 's' : ''} estimated impact
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Site:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${delay.siteName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Category:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${getCategoryEmoji(delay.category)} ${delay.category.charAt(0).toUpperCase() + delay.category.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Severity:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="background: ${getSeverityColor(delay.severity)}; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                    ${delay.severity.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Reported by:</td>
                <td style="padding: 10px 0; font-weight: 600;">${delay.createdBy}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'https://sitesync-app-1699d65dc716.herokuapp.com'}/dashboard/delays" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                View All Delays
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} SiteSync. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error sending delay notification:", error)
    return { success: false, error: "Failed to send email" }
  }
}
