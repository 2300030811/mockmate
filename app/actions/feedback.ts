"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

const feedbackSchema = z.object({
  type: z.enum(["bug", "suggestion", "other"]),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  sessionId: z.string().min(1, "Session ID is required"),
  userId: z.string().uuid().optional().nullable(),
});

function getEmailTemplate(validated: z.infer<typeof feedbackSchema>) {
  const colors = {
    bug: { bg: '#fef2f2', text: '#dc2626' },
    suggestion: { bg: '#f0fdf4', text: '#16a34a' },
    other: { bg: '#eff6ff', text: '#2563eb' }
  };
  
  const theme = colors[validated.type as keyof typeof colors];

  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc;">
      <div style="background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="background-color: #3b82f6; width: 4px; height: 24px; border-radius: 2px; margin-right: 12px;"></div>
          <h2 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700; letter-spacing: -0.025em;">New Feedback Received</h2>
        </div>
        
        <div style="margin-bottom: 24px;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${theme.bg}; color: ${theme.text};">
            ${validated.type}
          </span>
        </div>

        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #334155; font-style: italic;">
            "${validated.message}"
          </p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Context Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #94a3b8; width: 100px;">User ID</td>
              <td style="padding: 8px 0; font-size: 14px; color: #475569; font-family: monospace;">${validated.userId || "Guest"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">Session ID</td>
              <td style="padding: 8px 0; font-size: 14px; color: #475569; font-family: monospace;">${validated.sessionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">User Email</td>
              <td style="padding: 8px 0; font-size: 14px; color: #475569;">${validated.email || "Not provided"}</td>
            </tr>
          </table>
        </div>
      </div>
      <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
        Sent via MockMate internal feedback system
      </p>
    </div>
  `;
}

export async function submitFeedback(formData: {
  type: string;
  message: string;
  email?: string;
  sessionId: string;
  userId?: string | null;
}) {
  try {
    const validated = feedbackSchema.parse(formData);
    
    // 1. Rate Limiting (5 per hour)
    const rl = await rateLimit("feedback", validated.userId);
    if (!rl.success) {
      return { success: false, error: rl.message || "Too many feedback submissions. Please try again later." };
    }

    const supabase = createAdminClient();

    // 2. Define operations
    const dbOperation = supabase
      .from("feedback")
      .insert({
        type: validated.type,
        message: validated.message,
        email: validated.email || null,
        session_id: validated.sessionId,
        user_id: validated.userId || null,
      });

    const emailOperation = async () => {
      if (!env.RESEND_API_KEY || !env.FEEDBACK_EMAIL) return null;
      
      const resend = new Resend(env.RESEND_API_KEY);
      return resend.emails.send({
        from: "MockMate <onboarding@resend.dev>",
        to: env.FEEDBACK_EMAIL,
        subject: `[Feedback] ${validated.type.toUpperCase()}`,
        html: getEmailTemplate(validated),
      });
    };

    // 3. Execute in parallel for performance
    const [dbResult, emailResult] = await Promise.allSettled([
      dbOperation,
      emailOperation()
    ]);

    // Handle DB failure as critical
    if (dbResult.status === "rejected") throw dbResult.reason;
    if (dbResult.value.error) throw dbResult.value.error;

    // Log email failure as non-critical
    if (emailResult.status === "rejected" || (emailResult.status === "fulfilled" && (emailResult.value as any)?.error)) {
      console.warn("⚠️ [Feedback] DB Success, but Email failed:", emailResult.status === "rejected" ? emailResult.reason : (emailResult.value as any).error);
    }

    return { success: true };
  } catch (error) {
    console.error("Feedback submission error:", error);
    return { 
      success: false, 
      error: error instanceof z.ZodError ? error.errors[0].message : "Failed to submit feedback" 
    };
  }
}

