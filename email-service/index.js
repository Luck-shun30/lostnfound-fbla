import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const POLL_INTERVAL = 5000; // Poll every 5 seconds

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   - SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("   - RESEND_API_KEY");
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const resend = new Resend(RESEND_API_KEY);

// Constants
const FROM_EMAIL = "onboarding@resend.dev"; // Using Resend default domain for testing
const MAX_RETRIES = 3;

/**
 * Send a single email via Resend and update the email_queue status
 */
async function sendEmail(emailRecord) {
  const { id, recipient, subject, html_body, data, type } = emailRecord;

  try {
    console.log(`📧 Sending email to ${recipient} (ID: ${id})`);

    // Send email via Resend
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: subject,
      html: html_body,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Update status to sent
    const { error: updateError } = await supabase
      .from("email_queue")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`Failed to update email status: ${updateError.message}`);
    }

    console.log(`✅ Email sent successfully to ${recipient}`);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error(`❌ Failed to send email (ID: ${id}):`, error.message);

    // Update with error and increment retry count
    const retryCount = (emailRecord.retry_count || 0) + 1;
    const status = retryCount >= MAX_RETRIES ? "failed" : "pending";

    const { error: updateError } = await supabase
      .from("email_queue")
      .update({
        status: status,
        error_message: error.message,
        retry_count: retryCount,
      })
      .eq("id", id);

    if (updateError) {
      console.error(
        `Failed to update error status for email ${id}:`,
        updateError.message
      );
    }

    return { success: false, error: error.message };
  }
}

/**
 * Process all pending emails in the queue
 */
async function processPendingEmails() {
  try {
    // Fetch pending emails (excluding ones that have exceeded max retries)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lt("retry_count", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(10); // Process max 10 emails per cycle

    if (fetchError) {
      console.error("Failed to fetch pending emails:", fetchError.message);
      return;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log("ℹ️  No pending emails to send");
      return;
    }

    console.log(
      `📬 Found ${pendingEmails.length} pending email(s) to send...`
    );

    // Process each email
    for (const email of pendingEmails) {
      await sendEmail(email);
      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error("Error processing pending emails:", error);
  }
}

/**
 * Main loop - continuously process emails
 */
async function main() {
  console.log("🚀 Lost & Found Email Service Started");
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL}ms`);
  console.log("-----------------------------------");

  // Process emails immediately on startup
  await processPendingEmails();

  // Then poll every POLL_INTERVAL
  setInterval(processPendingEmails, POLL_INTERVAL);
}

main();
export default app;
