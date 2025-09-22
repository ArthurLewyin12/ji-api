import "dotenv/config";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
const resend = new Resend(process.env.RESEND_API_KEY);
if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set in your .env file");
}
export const sendWelcomeEmail = async (submission) => {
    const { email, prenoms } = submission;
    try {
        // Lire le template HTML
        const templatePath = path.join(process.cwd(), "src", "template", "welcomeEmail.html");
        let htmlContent = fs.readFileSync(templatePath, "utf-8");
        // Remplacer les placeholders
        htmlContent = htmlContent.replace(/\$\{prenoms\}/g, prenoms);
        const { data, error } = await resend.emails.send({
            from: "Acme <noreply@emmanueldev.pro>",
            to: [email],
            subject: "Bienvenue dans le programme de parrainage !",
            html: htmlContent,
        });
        if (error) {
            console.error("Error sending email:", error);
            return { success: false, error };
        }
        console.log("Email sent successfully:", data);
        return { success: true, data };
    }
    catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
};
