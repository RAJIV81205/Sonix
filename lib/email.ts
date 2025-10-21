// Email service using Brevo (formerly Sendinblue)
export async function sendOTPEmail(email: string, otp: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Your App';

  if (!brevoApiKey) {
    throw new Error('Brevo API key is missing');
  }

  const emailContent = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: email,
        name: email.split('@')[0],
      },
    ],
    subject: 'Password Reset OTP',
    textContent: `Your OTP for password reset is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                        You requested to reset your password. Use the verification code below to proceed:
                      </p>
                      <div style="background-color: #f3f4f6; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0;">
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; font-family: 'Courier New', monospace;">
                          ${otp}
                        </div>
                      </div>
                      <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                        <strong>Important:</strong> This code will expire in 10 minutes.
                      </p>
                      <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        This is an automated message, please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  // Send via Brevo API
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': brevoApiKey,
    },
    body: JSON.stringify(emailContent),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Brevo API error:', errorData);
    throw new Error('Failed to send email via Brevo');
  }

  const result = await response.json();
  return { success: true, messageId: result.messageId };
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
