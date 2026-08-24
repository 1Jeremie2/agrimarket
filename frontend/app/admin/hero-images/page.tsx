'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadHeroImage } from '@/lib/uploads';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

export default function HeroImagesAdminPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  function loadImages() {
    setLoading(true);
    api.heroImages.listAll().then(setImages).finally(() => setLoading(false));
  }

  function handleFileChange(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpload() {
    if (!file) return setError('Choisis une image à uploader.');
    setError(null);
    setUploading(true);

    try {
      const imageUrl = await uploadHeroImage(file);
      await api.heroImages.create({
        imageUrl,
        altText: altText || undefined,
        displayOrder: images.length,
      });
      toast('Image ajoutée au carrousel', 'success');
      setFile(null);
      setPreview(null);
      setAltText('');
      loadImages();
    } catch (err: any) {
      setError(err.message ?? 'Échec de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle(image: any) {
    if (image.active) await api.heroImages.deactivate(image.id);
    else await api.heroImages.activate(image.id);
    loadImages();
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer définitivement cette image du carrousel ?')) return;
    await api.heroImages.remove(id);
    toast('Image supprimée', 'info');
    loadImages();
  }

  if (loading) return <PageLoader />;

  const activeCount = images.filter((i) => i.active).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Images du hero</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gère les photos qui défilent en fond de la page d'accueil. {activeCount} image
        {activeCount > 1 ? 's' : ''} actuellement active{activeCount > 1 ? 's' : ''}.
      </p>

      <Card className="mt-6">
        <CardBody>
          <p className="text-sm font-semibold text-ink">Ajouter une image</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
            <label className="flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-surface hover:border-brand">
              {preview ? (
                <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon size={22} className="mx-auto" />
                  <p className="mt-1 text-xs">Choisir une photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="space-y-3">
              <Input
                label="Texte alternatif (accessibilité)"
                placeholder="Ex : Champ de maïs au lever du soleil, Bénin"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button size="sm" onClick={handleUpload} loading={uploading}>
                <Upload size={14} />
                Ajouter au carrousel
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {images.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ImageIcon}
            title="Aucune image configurée"
            description="Le hero affiche son dégradé de couleur par défaut tant qu'aucune image n'est ajoutée."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video bg-surface">
                <img src={image.imageUrl} alt={image.altText ?? ''} className="h-full w-full object-cover" />
              </div>
              <CardBody>
                <div className="flex items-center justify-between">
                  <Badge variant={image.active ? 'success' : 'neutral'}>
                    {image.active ? 'Active' : 'Désactivée'}
                  </Badge>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggle(image)} className="text-slate-400 hover:text-ink" title={image.active ? 'Désactiver' : 'Activer'}>
                      {image.active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => handleDelete(image.id)} className="text-slate-400 hover:text-red-500" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {image.altText && <p className="mt-2 truncate text-xs text-slate-500">{image.altText}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
