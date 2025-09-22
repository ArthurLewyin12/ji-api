import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prisma } from "./prisma.js";
import { sendWelcomeEmail } from "./email.js";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
// Configuration de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = new Hono();
// Fonction pour uploader un buffer vers Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        Readable.from(buffer).pipe(stream);
    });
};
// GET all submissions
app.get("/submissions", async (c) => {
    const submissions = await prisma.submission.findMany();
    return c.json(submissions);
});
// TEMP: Route pour vider la table
app.delete("/submissions/all", async (c) => {
    await prisma.submission.deleteMany({});
    return c.json({ message: "Toutes les soumissions ont été supprimées." });
});
// DELETE a submission by ID
app.delete("/submissions/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const submission = await prisma.submission.delete({
            where: { id },
        });
        return c.json({ message: "Soumission supprimée avec succès.", submission });
    }
    catch (error) {
        // P2025 is Prisma's code for "Record to delete does not exist."
        if (error.code === "P2025") {
            return c.json({ error: "Soumission non trouvée." }, 404);
        }
        console.error("Error deleting submission:", error);
        return c.json({ error: "Une erreur est survenue lors de la suppression." }, 500);
    }
});
// POST new submission
app.post("/submissions", async (c) => {
    try {
        const formData = await c.req.formData();
        // Récupération des champs textuels
        const data = {};
        formData.forEach((value, key) => {
            if (value instanceof File)
                return;
            data[key] = value;
        });
        // Récupération et upload du fichier photo
        const file = formData.get("photo");
        let photoPath = null;
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult = await uploadToCloudinary(buffer);
            photoPath = uploadResult.secure_url;
        }
        // Création de la submission dans la DB
        const submission = await prisma.submission.create({
            data: {
                nom: data.nom,
                prenoms: data.prenoms,
                age: Number(data.age),
                annee: data.annee,
                email: data.email,
                telephone: data.telephone,
                hobbies: JSON.parse(data.hobbies || "[]"),
                personnalite: data.personnalite,
                specialisationInteresse: JSON.parse(data.specialisationInteresse || "[]"),
                objectifsEtudes: JSON.parse(data.objectifsEtudes || "[]"),
                styleApprentissage: data.styleApprentissage,
                niveauTechnique: data.niveauTechnique,
                participationAsso: data.participationAsso,
                attentesParrainage: data.attentesParrainage,
                genreParrain: data.genreParrain,
                typeRelation: data.typeRelation,
                frequenceContact: data.frequenceContact,
                modeCommunication: data.modeCommunication,
                commentaires: data.commentaires || null,
                accepteConditions: data.accepteConditions === "true",
                photoPath: photoPath,
            },
        });
        // Envoi de l'e-mail de bienvenue en arrière-plan
        sendWelcomeEmail(submission);
        return c.json(submission, 201);
    }
    catch (err) {
        // Gérer les erreurs de contrainte unique de Prisma (P2002)
        if (err.code === "P2002") {
            const target = err.meta?.target;
            if (target?.includes("nom") && target?.includes("prenoms")) {
                return c.json({ error: "Un utilisateur avec ce nom et ce prénom existe déjà." }, 409);
            }
            if (target?.includes("email")) {
                return c.json({ error: "Cette adresse e-mail est déjà utilisée." }, 409);
            }
        }
        // Pour toutes les autres erreurs
        console.error("Error during submission:", err);
        return c.json({ error: "Une erreur inattendue est survenue." }, 500);
    }
});
app.get("/", (c) => c.text("Hello Hono!"));
app.post("/test-email", async (c) => {
    try {
        const { email, prenoms } = await c.req.json();
        if (!email || !prenoms) {
            return c.json({ error: "Les champs 'email' et 'prenoms' sont requis." }, 400);
        }
        console.log(`Envoi d'un e-mail de test à ${email}`);
        const result = await sendWelcomeEmail({ email, prenoms });
        if (result.success) {
            return c.json({ message: "E-mail de test envoyé avec succès !" });
        }
        else {
            return c.json({ message: "Échec de l'envoi de l'e-mail.", error: result.error }, 500);
        }
    }
    catch (error) {
        return c.json({ error: "Corps de la requête invalide." }, 400);
    }
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => console.log(`Server is running on http://localhost:${info.port}`));
