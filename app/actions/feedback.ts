"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";
import { env } from "@/lib/env";

const feedbackSchema = z.object({
  type: z.enum(["bug", "suggestion", "other"]),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  sessionId: z.string().min(1, "Session ID is required"),
  userId: z.string().uuid().optional().nullable(),
});

export async function submitFeedback(formData: {
  type: string;
  message: string;
  email?: string;
  sessionId: string;
  userId?: string | null;
}) {
  try {
    const validated = feedbackSchema.parse(formData);
    const supabase = createAdminClient();

    // 1. Save to Database
    const { error: dbError } = await supabase
      .from("feedback")
      .insert({
        type: validated.type,
        message: validated.message,
        email: validated.email || null,
        session_id: validated.sessionId,
        user_id: validated.userId || null,
      });

    if (dbError) throw dbError;

    // 2. Send Email Notification (if API Key exists)
    if (env.RESEND_API_KEY) {
      try {
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: "MockMate <onboarding@resend.dev>", // Note: Use verified domain in production
          to: env.FEEDBACK_EMAIL || "admin@mockmate.app",
          subject: `New Feedback: ${validated.type.toUpperCase()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
              <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New User Feedback</h2>
              <p><strong>Type:</strong> <span style="text-transform: capitalize; background: #eff6ff; padding: 2px 8px; border-radius: 4px; color: #1e40af;">${validated.type}</span></p>
              <p><strong>Message:</strong></p>
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; font-style: italic;">
                "${validated.message}"
              </div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 0.85rem; color: #6b7280;">
                <strong>User ID:</strong> ${validated.userId || "Guest"}<br />
                <strong>Session ID:</strong> ${validated.sessionId}<br />
                <strong>User Email:</strong> ${validated.email || "Not provided"}
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("⚠️ [Feedback] DB Success, but Email failed:", emailErr);
        // We don't throw here strictly because the feedback IS saved to DB
      }
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

