// ================================================================
// email.js - Envoi d'emails aux employés via Resend
// ================================================================
// Ce fichier envoie les identifiants de connexion aux nouveaux
// employés par email en utilisant Resend (https://resend.com).
//
// Le sandbox onboarding@resend.dev permet d'envoyer à n'importe
// quelle adresse sans vérifier de domaine (100 emails/jour gratuits).
//
// Configuration requise dans .env :
//   RESEND_API_KEY=re_...
//   EMAIL_FROM=Presence Coryas <onboarding@resend.dev>
//
// Fallback : les identifiants sont toujours affichés dans la console.
// ============================================================

const { Resend } = require("resend");

let resendClient = null;

function initResend() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("⚠️ RESEND_API_KEY non définie dans les variables d'env");
    return null;
  }
  resendClient = new Resend(apiKey);
  console.log("✅ Client Resend initialisé");
  return resendClient;
}

async function sendCredentials(to, { prenom, nom, email, password, matricule }) {
  console.log("\n========================================");
  console.log("NOUVEL EMPLOYÉ - Identifiants de connexion");
  console.log("========================================");
  console.log("  Matricule :", matricule);
  console.log("  Email     :", email);
  console.log("  Mot passe :", password);
  console.log("========================================\n");

  const resend = initResend();
  if (!resend) {
    console.log("Aucun client email - identifiants uniquement dans la console");
    return false;
  }

  const from = process.env.EMAIL_FROM || "Presence Coryas <onboarding@resend.dev>";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
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
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return false;
    }

    console.log("✅ Email envoyé avec succès à", to, ":", data?.id);
    return true;
  } catch (err) {
    console.error("Erreur envoi email via Resend:", err.message);
    return false;
  }
}

module.exports = { sendCredentials };
