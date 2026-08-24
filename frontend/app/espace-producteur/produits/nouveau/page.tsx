'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadProductPhoto } from '@/lib/uploads';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';

const UNITS = ['KG', 'G', 'LITRE', 'BOTTE', 'PIECE', 'CAGETTE'];

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceB2c, setPriceB2c] = useState('');
  const [priceB2b, setPriceB2b] = useState('');
  const [unit, setUnit] = useState('KG');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  function handleFileChange(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        setUploadProgress('Envoi de la photo…');
        photoUrl = await uploadProductPhoto(photoFile);
        setUploadProgress(null);
      }
      await api.products.create({ name, description, priceB2c: Number(priceB2c), priceB2b: Number(priceB2b), unit, photoUrl });
      toast('Produit publié avec succès', 'success');
      router.push('/espace-producteur/produits');
    } catch (err: any) {
      setError(err.message ?? 'Impossible de créer le produit');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-ink">Ajouter un produit</h1>

      <Card className="mt-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink">Photo du produit</label>
              <label className="mt-2 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-surface hover:border-brand">
                {photoPreview ? (
                  <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImagePlus size={24} className="mx-auto" />
                    <p className="mt-1 text-xs">Cliquer pour choisir une photo</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            <Input label="Nom du produit" value={name} onChange={(e) => setName(e.target.value)} required />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Prix particulier (FCFA)" type="number" min="0" step="0.01" value={priceB2c} onChange={(e) => setPriceB2c(e.target.value)} required />
              <Input label="Prix professionnel (FCFA)" type="number" min="0" step="0.01" value={priceB2b} onChange={(e) => setPriceB2b(e.target.value)} required />
            </div>

            <Select label="Unité" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>

            {uploadProgress && <p className="text-sm text-slate-500">{uploadProgress}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={submitting} className="w-full">
              Publier le produit
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
