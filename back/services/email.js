const nodemailer = require("nodemailer");

let transporter = null;
let etherealUrl = "";

async function getTransporter() {
    if (transporter) return transporter;

    // 1. Essayer SMTP configuré (Gmail)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const test = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_PORT === "465",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Vérifier si les identifiants sont valides
        try {
            await test.verify();
            transporter = test;
            console.log("SMTP Gmail configuré et fonctionnel");
            return transporter;
        } catch (e) {
            console.log("SMTP Gmail non fonctionnel (" + e.message + ") - utilisation d'Ethereal (dev)");
        }
    }

    // 2. Fallback: Ethereal (SMTP de test, fonctionne sans inscription)
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        etherealUrl = "https://ethereal.email/login";
        console.log("SMTP Ethereal actif - Voir les emails sur", etherealUrl);
        console.log("  User:", testAccount.user);
        console.log("  Pass:", testAccount.pass);
    } catch (e) {
        console.error("Impossible de créer un compte Ethereal:", e.message);
    }

    return transporter;
}

async function sendCredentials(to, { prenom, nom, email, password, matricule }) {
    // Toujours afficher les identifiants dans la console du serveur
    console.log("\n========================================");
    console.log("NOUVEL EMPLOYE - Identifiants de connexion");
    console.log("========================================");
    console.log("  Matricule :", matricule);
    console.log("  Email     :", email);
    console.log("  Mot passe :", password);
    if (etherealUrl) console.log("  Voir email :", etherealUrl);
    console.log("========================================\n");

    const smtp = await getTransporter();
    if (!smtp) {
        console.log("Aucun serveur SMTP disponible");
        return false;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || (smtp.options && smtp.options.auth && smtp.options.auth.user) || "noreply@presence-coryas.com",
        to,
        subject: "Vos identifiants Presence Coryas",
        html: `
            <h1>Bonjour ${prenom} ${nom},</h1>
            <p>Votre compte a été créé avec succès.</p>
            <p>Vos identifiants de connexion :</p>
            <ul>
                <li><strong>Matricule :</strong> ${matricule}</li>
                <li><strong>Email :</strong> ${email}</li>
                <li><strong>Mot de passe :</strong> ${password}</li>
            </ul>
            <p>Connectez-vous sur l'application mobile ou le portail web.</p>
            <p>Cordialement,<br>L'équipe Presence Coryas</p>
        `,
    };

    try {
        const info = await smtp.sendMail(mailOptions);
        console.log("Email envoyé avec succès à", to, ":", info.messageId);
        if (etherealUrl) {
            console.log("  -> Voir l'email sur:", nodemailer.getTestMessageUrl(info));
        }
        return true;
    } catch (error) {
        console.error("Erreur envoi email à", to, ":", error.message);
        return false;
    }
}

module.exports = { sendCredentials };
