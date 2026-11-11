'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Church, Eye, EyeOff, FileText, GraduationCap, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { adminFetch, API, ApiError } from '@/lib/adminApi';
import { Button, EmptyState, PageHeader, SkeletonRows, useConfirm, useToast } from '@/components/admin/ui';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  pdfFilename: string | null;
  isVisible: boolean;
  date: string;
}

const CATEGORIES = [
  { key: 'ecole-dimanche', label: 'École du Dimanche', icon: BookOpen, color: 'bg-amber-50 text-amber-700' },
  { key: 'cours-specifiques', label: 'Cours Spécifiques', icon: GraduationCap, color: 'bg-sky-50 text-sky-700' },
  { key: 'messes-dimanche', label: 'Présentations du Dimanche', icon: Church, color: 'bg-violet-50 text-violet-700' },
];

const MAX_PDF_MB = 20;

function CourseForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const pickFile = (file: File | null) => {
    if (file && file.type !== 'application/pdf') { toast('error', 'Seuls les fichiers PDF sont acceptés.'); return; }
    if (file && file.size > MAX_PDF_MB * 1024 * 1024) { toast('error', `Le PDF ne doit pas dépasser ${MAX_PDF_MB} Mo.`); return; }
    setPdfFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('category', category);
    if (pdfFile) form.append('pdf', pdfFile);
    try {
      await adminFetch('/api/admin/courses', { method: 'POST', body: form });
      toast('success', 'Cours publié.');
      onCreated();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : "Erreur lors de l'ajout du cours.");
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition';

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2 flex items-center justify-between">
        <h2 className="font-black text-gray-900">Nouveau cours</h2>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-900" aria-label="Fermer le formulaire"><X size={18} /></button>
      </div>
      <label className="md:col-span-2 block">
        <span className="block text-xs font-bold text-gray-600 mb-1.5">Titre *</span>
        <input className={field} value={title} onChange={e => setTitle(e.target.value)} required maxLength={255} autoFocus />
      </label>
      <label className="md:col-span-2 block">
        <span className="block text-xs font-bold text-gray-600 mb-1.5">Description</span>
        <textarea className={`${field} h-24 resize-none`} value={description} onChange={e => setDescription(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-xs font-bold text-gray-600 mb-1.5">Catégorie</span>
        <select className={field} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </label>
      <div>
        <span className="block text-xs font-bold text-gray-600 mb-1.5">Fichier PDF <span className="font-normal text-gray-400">({MAX_PDF_MB} Mo max.)</span></span>
        {pdfFile ? (
          <div className="flex items-center gap-2 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm">
            <FileText size={16} className="text-emerald-600 shrink-0" />
            <span className="truncate flex-1">{pdfFile.name}</span>
            <button type="button" onClick={() => setPdfFile(null)} className="text-gray-400 hover:text-gray-900" aria-label="Retirer le fichier"><X size={16} /></button>
          </div>
        ) : (
          <label className="flex items-center gap-2 border border-dashed border-gray-300 px-3.5 py-2.5 rounded-xl cursor-pointer hover:border-gray-900 transition text-sm text-gray-500">
            <Upload size={16} /> Choisir un fichier…
            <input type="file" accept="application/pdf" className="sr-only" onChange={e => pickFile(e.target.files?.[0] || null)} />
          </label>
        )}
      </div>
      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={saving || !title.trim()}>{saving ? 'Publication…' : 'Publier le cours'}</Button>
      </div>
    </form>
  );
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      const data = await adminFetch<Course[]>('/api/admin/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) router.push('/dashboard');
      else toast('error', 'Impossible de charger les cours.');
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const toggleVisibility = async (course: Course) => {
    try {
      await adminFetch(`/api/admin/courses/${course.id}/visibility`, { method: 'PATCH', body: JSON.stringify({ isVisible: !course.isVisible }) });
      setCourses(list => list.map(c => (c.id === course.id ? { ...c, isVisible: !c.isVisible } : c)));
      toast('success', course.isVisible ? 'Cours masqué du site.' : 'Cours de nouveau visible sur le site.');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erreur lors de la mise à jour.');
    }
  };

  const deleteCourse = async (course: Course) => {
    const ok = await confirm({
      title: 'Supprimer ce cours ?',
      message: `« ${course.title} »${course.pdfFilename ? ' et son PDF' : ''} seront supprimés définitivement. Pour le retirer du site sans le perdre, masquez-le plutôt.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
      setCourses(list => list.filter(c => c.id !== course.id));
      toast('success', 'Cours supprimé.');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(c =>
      (filterCat === 'all' || c.category === filterCat) &&
      (!q || `${c.title} ${c.description}`.toLowerCase().includes(q)));
  }, [courses, filterCat, search]);

  return (
    <>
      <PageHeader
        title="Cours"
        subtitle="Les enseignements et supports PDF publiés sur le site."
        actions={!showForm && <Button onClick={() => setShowForm(true)}><Plus size={16} /> Ajouter un cours</Button>}
      />

      {showForm && <CourseForm onCreated={() => { setShowForm(false); fetchCourses(); }} onCancel={() => setShowForm(false)} />}

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <label className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 focus-within:border-gray-900 transition">
          <Search size={16} className="text-gray-400 mr-3" />
          <span className="sr-only">Rechercher un cours</span>
          <input type="search" placeholder="Rechercher un cours…" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-sm w-full" />
        </label>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto" role="tablist" aria-label="Filtrer par catégorie">
          {[{ key: 'all', label: 'Tous' }, ...CATEGORIES].map(c => (
            <button
              key={c.key}
              role="tab"
              aria-selected={filterCat === c.key}
              onClick={() => setFilterCat(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${filterCat === c.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {c.label} <span className="opacity-60">{c.key === 'all' ? courses.length : courses.filter(x => x.category === c.key).length}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonRows rows={4} /> : visible.length === 0 ? (
        <EmptyState icon={<BookOpen size={20} />} title={courses.length === 0 ? 'Aucun cours publié' : 'Aucun cours ne correspond'}
          text={courses.length === 0 ? 'Cliquez sur « Ajouter un cours » pour publier le premier.' : undefined} />
      ) : (
        <ul className="space-y-3">
          {visible.map(course => {
            const cat = CATEGORIES.find(c => c.key === course.category);
            const CatIcon = cat?.icon;
            return (
              <li key={course.id} className={`bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${course.isVisible ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50/60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {cat && CatIcon && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cat.color}`}><CatIcon size={12} /> {cat.label}</span>
                    )}
                    {!course.isVisible && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-200 text-gray-600"><EyeOff size={12} /> Masqué</span>
                    )}
                  </div>
                  <h3 className={`font-bold truncate ${course.isVisible ? 'text-gray-900' : 'text-gray-500'}`}>{course.title}</h3>
                  {course.description && <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{course.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>Publié le {new Date(course.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {/* Un cours masqué n'est téléchargeable qu'avec le jeton admin : pas de lien direct */}
                    {course.pdfFilename && !course.isVisible && (
                      <span className="inline-flex items-center gap-1 font-semibold"><FileText size={12} /> PDF joint</span>
                    )}
                    {course.pdfFilename && course.isVisible && (
                      <a href={`${API}/api/courses/${course.id}/download`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold">
                        <FileText size={12} /> PDF
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => toggleVisibility(course)}>
                    {course.isVisible ? <><EyeOff size={14} /> Masquer</> : <><Eye size={14} /> Afficher</>}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCourse(course)} className="hover:!text-red-600 hover:!bg-red-50"
                    aria-label={`Supprimer ${course.title}`} title="Supprimer">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
