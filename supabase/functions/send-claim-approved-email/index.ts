import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ClaimApprovedEmailRequest {
  claimantName: string;
  claimantEmail: string;
  itemTitle: string;
  itemLocation: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { claimantName, claimantEmail, itemTitle, itemLocation }: ClaimApprovedEmailRequest = await req.json();

    console.log("Sending claim approved email to:", claimantEmail);

    const emailResponse = await resend.emails.send({
      from: "Lost & Found <onboarding@resend.dev>",
      to: [claimantEmail],
      subject: `Your claim for "${itemTitle}" has been approved!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a5f3c; margin-bottom: 20px;">Great news, ${claimantName}!</h1>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your claim for <strong>"${itemTitle}"</strong> has been approved by our team.
          </p>
          <div style="background-color: #f4f4f4; border-left: 4px solid #c9a227; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #333;">
              <strong>📍 Pick up location:</strong> ${itemLocation}
            </p>
          </div>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Please bring a valid ID when collecting your item. If you have any questions, feel free to contact the lost and found office.
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Best regards,<br>
            The Lost & Found Team
          </p>
        </div>
      `,
      reply_to: "onboarding@resend.dev",
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-claim-approved-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
