// Upload de fichiers vers Cloudflare R2, via URL signée générée par le backend.
// Le navigateur n'a JAMAIS accès aux clés R2 (secrètes) — il ne reçoit du backend
// qu'une URL temporaire (5 min) à usage unique pour cet upload précis.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function uploadFile(kind: 'product-photos' | 'payment-proofs' | 'hero-images', file: File): Promise<string> {
  const token = getToken();
  const fileExtension = file.name.split('.').pop() ?? 'jpg';

  // 1. Demande une URL d'upload signée au backend (authentifié)
  const presignRes = await fetch(`${API_URL}/uploads/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ kind, fileExtension }),
  });

  if (!presignRes.ok) {
    throw new Error('Impossible de préparer l\'upload — reconnecte-toi et réessaie.');
  }
  const { uploadUrl, publicUrl } = await presignRes.json();

  // 2. Envoie le fichier directement à Cloudflare R2 avec cette URL signée
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Échec de l\'envoi du fichier vers le stockage.');
  }

  return publicUrl;
}

export function uploadProductPhoto(file: File): Promise<string> {
  return uploadFile('product-photos', file);
}

export function uploadPaymentProof(file: File): Promise<string> {
  return uploadFile('payment-proofs', file);
}

export function uploadHeroImage(file: File): Promise<string> {
  return uploadFile('hero-images', file);
}
