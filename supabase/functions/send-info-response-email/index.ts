import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InfoResponseEmailRequest {
  requesterName: string;
  requesterEmail: string;
  itemTitle: string;
  originalQuestion: string;
  adminResponse: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { requesterName, requesterEmail, itemTitle, originalQuestion, adminResponse }: InfoResponseEmailRequest = await req.json();

    console.log("Sending info response email to:", requesterEmail);

    const emailResponse = await resend.emails.send({
      from: "Lost & Found <onboarding@resend.dev>",
      to: [requesterEmail],
      subject: `Response to your inquiry about "${itemTitle}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a5f3c; margin-bottom: 20px;">Hello ${requesterName}!</h1>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We've received a response to your inquiry about <strong>"${itemTitle}"</strong>.
          </p>
          
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>Your question:</strong></p>
            <p style="margin: 0; color: #333; font-style: italic;">"${originalQuestion}"</p>
          </div>
          
          <div style="background-color: #e8f5e9; border-left: 4px solid #1a5f3c; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1a5f3c; font-size: 14px;"><strong>Response from our team:</strong></p>
            <p style="margin: 0; color: #333;">${adminResponse}</p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            If you believe this is your item, please submit a claim through our website. If you have further questions, feel free to reach out.
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
    console.error("Error in send-info-response-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
