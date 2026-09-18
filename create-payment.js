export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { amount } = req.body || {};
  const parsedAmount = Number(amount);

  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    // ⚠️ endpoint et noms de champs à confirmer avec la doc SasPay
    // (section "Payment Links" / "Créer un paiement" de docs.saspay.me)
    const response = await fetch('https://api.saspay.me/v1/payment-links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SASPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parsedAmount,
        currency: 'XOF',
        description: 'Soutien - site BOULKA'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Erreur SasPay' });
    }

    // ⚠️ nom exact du champ à confirmer (checkout_url / payment_url / url ...)
    const url = data.checkout_url || data.payment_url || data.url;

    if (!url) {
      return res.status(500).json({ error: 'Réponse SasPay inattendue' });
    }

    return res.status(200).json({ url });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
