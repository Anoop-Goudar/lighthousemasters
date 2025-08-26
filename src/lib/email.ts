import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail(
  to: string, 
  subject: string, 
  message: string,
  actionUrl?: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email send");
      return { success: false, error: "Email service not configured" };
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Lighthouse Management System</h2>
        <h3 style="color: #555;">${subject}</h3>
        <p style="color: #666; line-height: 1.6;">${message}</p>
        ${actionUrl ? `
          <div style="margin: 20px 0;">
            <a href="${actionUrl}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Details
            </a>
          </div>
        ` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          This is an automated message from Lighthouse Management System.
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Lighthouse System <noreply@lighthouse.com>',
      to: [to],
      subject: `Lighthouse: ${subject}`,
      html: htmlContent,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendBookingConfirmation(
  userEmail: string,
  userName: string,
  facilityName: string,
  bookingDate: string,
  bookingTime: string
) {
  const subject = "Booking Confirmation";
  const message = `
    Hi ${userName},
    
    Your booking has been confirmed for ${facilityName} on ${bookingDate} at ${bookingTime}.
    
    Please arrive 10 minutes early for your session.
    
    Thank you for using Lighthouse Management System!
  `;

  return sendNotificationEmail(userEmail, subject, message);
}

export async function sendTrainingReminder(
  userEmail: string,
  userName: string,
  activityType: string,
  sessionDate: string,
  coachName: string
) {
  const subject = "Training Session Reminder";
  const message = `
    Hi ${userName},
    
    This is a reminder about your upcoming ${activityType} session on ${sessionDate} with coach ${coachName}.
    
    Please bring appropriate equipment and arrive on time.
    
    Good luck with your training!
  `;

  return sendNotificationEmail(userEmail, subject, message);
}
