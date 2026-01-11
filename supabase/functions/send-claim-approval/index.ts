import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Initialize Resend with API key from environment variables
const apiKey = Deno.env.get("RESEND_API_KEY");
if (!apiKey) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}
const resend = new Resend(apiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ClaimApprovalRequest {
  claimantName: string;
  claimantEmail: string;
  itemTitle: string;
  itemLocation: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claimantName, claimantEmail, itemTitle, itemLocation }: ClaimApprovalRequest = await req.json();

    console.log("Sending claim approval email to:", claimantEmail);

    // Send email using Resend API
    const emailResponse = await resend.emails.send({
      from: "Lost & Found <onboarding@resend.dev>",
      to: [claimantEmail],
      subject: "Your Lost Item Claim Has Been Approved!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a5a3c 0%, #c9a227 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Great News!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border: 2px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi <strong>${claimantName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Your claim for <strong>"${itemTitle}"</strong> has been approved!
            </p>
            
            <div style="background: white; border: 2px solid #1a5a3c; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1a5a3c; margin: 0 0 10px 0;">📍 Pickup Location</h3>
              <p style="font-size: 18px; color: #333; margin: 0; font-weight: 600;">
                ${itemLocation}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Please bring a valid student ID when picking up your item.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong>The Lost & Found Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-claim-approval function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
