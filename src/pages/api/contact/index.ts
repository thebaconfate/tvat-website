import { contactFormSchema } from "@/lib/domain/contact";
import { resend } from "@/lib/resend";
import sanitizeHtml from "sanitize-html";
import type { APIContext } from "astro";
import z4 from "zod/v4";
import { config } from "@/lib/config";
import { resendService } from "@/lib/services/resend/resend.service";

/*
 * NOTE: Perhaps add some rate limiting to protect your resend api
 */

export async function POST({ request }: APIContext) {
  try {
    const data = await request.json();
    const rawForm = contactFormSchema.parse(data);
    const form = {
      name: sanitizeHtml(rawForm.name, { allowedTags: [] }),
      email: rawForm.email,
      subject: sanitizeHtml(rawForm.subject, { allowedTags: [] }),
      message: sanitizeHtml(rawForm.message.replace(/\n/g, "<br>")),
    };
    const html = `
<h2>Contact form submission</h2>
<p><strong>Name:</strong> ${form.name || "N/A"}</p>
<p><strong>Email:</strong> ${form.email}</p>
<p><strong>Subject:</strong> ${form.subject || "N/A"}</p>
<p><strong>Message:</strong></p>
<p>${form.message}</p>
<hr>
<p><em>Sent from website contact form</em></p>
`;
    const url = new URL(request.url);
    const { error } = await resend.emails.send({
      from: `${form.name} <noreply@${config.resend.domain}>`,
      to: `${config.email}`,
      subject: form.subject,
      html: html,
      replyTo: `${form.name} <${form.email}>`,
    });
    if (!error) return new Response(null, { status: 200 });
    if (error.statusCode == 429) {
      resendService.enqueue("contact", form, form.email);
      return new Response(null, { status: 200 });
    }
    console.error(error);
    return new Response(
      JSON.stringify("Something went wrong with the email server"),
      { status: 500 },
    );
  } catch (e) {
    console.error(e);
    if (e instanceof z4.ZodError) {
      return new Response(JSON.stringify(z4.treeifyError(e)), { status: 400 });
    }
    return new Response(JSON.stringify("Something went wrong"), {
      status: 500,
    });
  }
}
