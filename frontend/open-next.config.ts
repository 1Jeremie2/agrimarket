// Configuration de l'adaptateur officiel Cloudflare pour Next.js (@opennextjs/cloudflare)
// Permet de déployer ce frontend sur Cloudflare Pages/Workers sans mise en veille
// (contrairement au plan gratuit Render).
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig();
