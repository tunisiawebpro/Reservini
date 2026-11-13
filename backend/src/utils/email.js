import { Resend } from 'resend';

// Initialisation de Resend avec ta clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export const generateCodeTemplate = (code, title = "Votre code de vérification") => `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #faf7f2; padding: 40px; text-align: center;">
    <div style="max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <h1 style="color: #5d4b6b; font-family: 'Georgia', serif; font-style: italic; margin-bottom: 10px;">Reservini</h1>
      <h2 style="color: #333; font-size: 18px; margin-bottom: 30px;">${title}</h2>
      <div style="background: #f0e8ff; color: #5d4b6b; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        ${code}
      </div>
      <p style="color: #666; font-size: 14px;">Ce code expire dans <strong>5 minutes</strong>.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    </div>
  </div>
`;

export const sendVerificationEmail = async (to, subject, code, title) => {
  try {
    const html = generateCodeTemplate(code, title);
    
    // ⚠️ IMPORTANT : Sur le plan gratuit de Resend, tu DOIS utiliser 'onboarding@resend.dev' 
    // comme expéditeur jusqu'à ce que tu vérifies ton propre nom de domaine.
    const { data, error } = await resend.emails.send({
      from: 'Reservini <onboarding@resend.dev>', 
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      console.log(`📧 [DEV FALLBACK] Code pour ${to}: ${code}`);
      return;
    }

    console.log(`✅ Email envoyé avec succès à ${to} (ID: ${data.id})`);
  } catch (error) {
    console.error('❌ Erreur email:', error);
    console.log(`📧 [DEV FALLBACK] Code pour ${to}: ${code}`);
  }
};

export const sendOrderAcceptedEmail = async (to, orderNumber, clientName) => {
  try {
    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #faf7f2; padding: 40px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <h1 style="color: #5d4b6b; font-family: 'Georgia', serif; font-style: italic; margin-bottom: 10px;">Reservini</h1>
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">Commande #${orderNumber} Acceptée ! 🎉</h2>
          <p style="color: #666; font-size: 15px; line-height: 1.6;">
            Bonjour <strong>${clientName}</strong>,<br><br>
            Nous avons bien reçu votre commande et notre équipe l'a <strong>acceptée</strong>.<br>
            Un membre de notre équipe vous contactera très prochainement par téléphone pour confirmer les derniers détails.
          </p>
          <div style="margin-top: 30px; padding: 20px; background: #f0e8ff; border-radius: 12px; color: #5d4b6b; font-weight: bold;">
            Merci de votre confiance !
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">L'équipe Reservini</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Reservini <onboarding@resend.dev>',
      to: [to],
      subject: `✅ Commande #${orderNumber} acceptée - Reservini`,
      html: html,
    });
  } catch (error) {
    console.error('Erreur email accepted:', error);
  }
};