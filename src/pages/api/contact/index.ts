import { contactFormSchema } from "@/lib/domain/contact";
import sanitizeHtml from "sanitize-html";
import type { APIContext } from "astro";
import z4 from "zod/v4";
import { config } from "@/lib/config";
import { resend, resendService } from "@/lib/services/resend/resend.service";

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
        <p><strong>Name:</strong> ${form.name || "N/A"}</p>
        <p><strong>Email:</strong> ${form.email}</p>
        <p><strong>Subject:</strong> ${form.subject || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${form.message}</p>
        <hr>`;
    const tvatHtml = `
        <h2>Contact form submission</h2>
        ${html}
        <p><em>Sent from website contact form</em></p>
        `;
    const { error } = await resend.emails.send({
      from: `${form.name} <contact-form@${config.resend.domain}>`,
      to: `${config.email}`,
      subject: form.subject,
      html: tvatHtml,
      replyTo: `${form.name} <${form.email}>`,
    });
    if (!error) {
      const submiteeHtml = `
        <h2>Thank you for submitting the form</h2>
        <h3>Your form details:</h3>
        ${html}`;
      try {
        const { error } = await resend.emails.send({
          from: `'t VAT <contact-form${config.resend.domain}>`,
          to: `${form.email}`,
          subject: `CONTACT FORM SUBMISSION`,
          html: `${submiteeHtml}`,
          replyTo: config.email,
        });
        console.log(error);
      } finally {
        return new Response(null, { status: 200 });
      }
    }
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
