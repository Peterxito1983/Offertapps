const { onValueCreated } = require("firebase-functions/v2/database");
const { set } = require("firebase-admin/database");
const admin = require("firebase-admin");
const { postToSocialMedia } = require("./socialService");

admin.initializeApp();

/**
 * Trigger que se dispara cuando se crea una nueva oferta
 */
exports.autoPostOfferToSocial = onValueCreated("/offers/{offerId}", async (event) => {
    const offerData = event.data.val();
    const offerId = event.params.offerId;

    console.log(`Nueva oferta detectada: ${offerId}. Iniciando automatización social...`);

    try {
        // Ejecutar publicación
        const socialResult = await postToSocialMedia({
            title: offerData.title,
            description: offerData.description,
            imageUrl: offerData.imageUrl,
            discount: offerData.discount
        });

        if (socialResult && Array.isArray(socialResult)) {
            // Actualizar la oferta en la base de datos para marcarla como publicada
            const db = admin.database();
            const updates = {
                socialMediaPosted: true,
                lastSocialUpdate: new Date().toISOString()
            };

            // Mapear IDs por plataforma
            socialResult.forEach(res => {
                if (res.platform === 'instagram') updates.instagramPostId = res.id;
                if (res.platform === 'facebook') updates.facebookPostId = res.id;
            });

            await db.ref(`offers/${offerId}`).update(updates);
            console.log(`Oferta ${offerId} actualizada con estados de: ${socialResult.map(r => r.platform).join(', ')}`);
        }
    } catch (error) {
        console.error(`Fallo la automatización social para la oferta ${offerId}:`, error);

        // Opcional: registrar el error en la oferta para que el usuario sepa
        const db = admin.database();
        await db.ref(`offers/${offerId}`).update({
            socialMediaError: error.message,
            socialMediaPosted: false
        });
    }
});
