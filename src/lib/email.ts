// Email utility for queuing emails to be sent via external service
import { supabase } from "@/integrations/supabase/client";

interface EmailQueuePayload {
  recipient: string;
  subject: string;
  html_body: string;
  data?: Record<string, any>;
  type: string;
}

const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const generateClaimApprovalEmailHTML = (
  claimantName: string,
  itemTitle: string,
  itemDescription: string,
  itemLocation: string,
  itemDateFound: string,
  pickupInstructions: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background-color: #f5f5f5; padding: 20px; border-radius: 8px; }
          .item-detail { margin: 15px 0; }
          .label { font-weight: bold; color: #000; }
          .value { color: #666; margin-top: 5px; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Your Lost Item Has Been Found!</h2>
          </div>
          <div class="content">
            <p>Hi ${escapeHtml(claimantName)},</p>
            <p>Great news! Your claim for the following item has been approved:</p>
            
            <div class="item-detail">
              <div class="label">Item:</div>
              <div class="value">${escapeHtml(itemTitle)}</div>
            </div>
            
            <div class="item-detail">
              <div class="label">Description:</div>
              <div class="value">${escapeHtml(itemDescription)}</div>
            </div>
            
            <div class="item-detail">
              <div class="label">Where it was found:</div>
              <div class="value">${escapeHtml(itemLocation)}</div>
            </div>
            
            <div class="item-detail">
              <div class="label">Date Found:</div>
              <div class="value">${escapeHtml(itemDateFound)}</div>
            </div>
            
            <div class="item-detail">
              <div class="label">Pickup Instructions:</div>
              <div class="value">${escapeHtml(pickupInstructions)}</div>
            </div>
            
            <p style="margin-top: 20px;">If you have any questions, please contact the Lost & Found office.</p>
            <p>Thank you,<br/>Stevenson High School Lost & Found</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const generateInfoResponseEmailHTML = (
  requesterName: string,
  itemTitle: string,
  originalQuestion: string,
  adminResponse: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fbbf24; color: #000; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background-color: #f5f5f5; padding: 20px; border-radius: 8px; }
          .section { margin: 15px 0; padding: 15px; background-color: #fff; border-left: 4px solid #fbbf24; }
          .label { font-weight: bold; color: #000; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Response to Your Inquiry</h2>
          </div>
          <div class="content">
            <p>Hi ${escapeHtml(requesterName)},</p>
            <p>Thank you for your inquiry about the item. Here is the response:</p>
            
            <div class="section">
              <div class="label">Item:</div>
              <p>${escapeHtml(itemTitle)}</p>
            </div>
            
            <div class="section">
              <div class="label">Your Question:</div>
              <p>"${escapeHtml(originalQuestion)}"</p>
            </div>
            
            <div class="section">
              <div class="label">Response:</div>
              <p>${escapeHtml(adminResponse)}</p>
            </div>
            
            <p style="margin-top: 20px;">If you have any follow-up questions, please don't hesitate to reach out.</p>
            <p>Thank you,<br/>Stevenson High School Lost & Found</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const sendClaimApprovalEmail = async (
  claimantName: string,
  claimantEmail: string,
  itemTitle: string,
  itemDescription: string,
  itemLocation: string,
  itemDateFound: string,
  pickupInstructions: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const htmlBody = generateClaimApprovalEmailHTML(
      claimantName,
      itemTitle,
      itemDescription,
      itemLocation,
      itemDateFound,
      pickupInstructions
    );

    const { data, error } = await supabase
      .from("email_queue")
      .insert({
        recipient: claimantEmail,
        subject: `Your Claim for "${itemTitle}" Has Been Approved`,
        html_body: htmlBody,
        data: {
          claimantName,
          itemTitle,
          itemLocation,
          itemDateFound,
        },
        status: "pending",
        type: "claim_approval",
      })
      .select();

    if (error) {
      console.error("Failed to queue claim approval email:", error);
      return { success: false, error: error.message };
    }

    console.log("Claim approval email queued successfully:", data);
    return { success: true };
  } catch (error) {
    console.error("Error queuing claim approval email:", error);
    return { success: false, error: String(error) };
  }
};

export const sendInfoResponseEmail = async (
  requesterName: string,
  requesterEmail: string,
  itemTitle: string,
  originalQuestion: string,
  adminResponse: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const htmlBody = generateInfoResponseEmailHTML(
      requesterName,
      itemTitle,
      originalQuestion,
      adminResponse
    );

    const { data, error } = await supabase
      .from("email_queue")
      .insert({
        recipient: requesterEmail,
        subject: `Response to Your Inquiry About "${itemTitle}"`,
        html_body: htmlBody,
        data: {
          requesterName,
          itemTitle,
          originalQuestion,
        },
        status: "pending",
        type: "info_response",
      })
      .select();

    if (error) {
      console.error("Failed to queue info response email:", error);
      return { success: false, error: error.message };
    }

    console.log("Info response email queued successfully:", data);
    return { success: true };
  } catch (error) {
    console.error("Error queuing info response email:", error);
    return { success: false, error: String(error) };
  }
};
