'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Trash2, Plus, FileText, BookOpen, GraduationCap, Church, ArrowLeft, Upload } from 'lucide-react';

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
    { key: 'ecole-dimanche', label: 'École du Dimanche', icon: <BookOpen size={14} />, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { key: 'cours-specifiques', label: 'Cours Spécifiques', icon: <GraduationCap size={14} />, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { key: 'messes-dimanche', label: 'Présentations du Dimanche', icon: <Church size={14} />, color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('ecole-dimanche');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [filterCat, setFilterCat] = useState<string>('all');
    const router = useRouter();
    const token = Cookies.get('token');

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API}/api/admin/courses`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.status === 403) { router.push('/dashboard'); return; }
            const data = await res.json();
            if (Array.isArray(data)) setCourses(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !category) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('category', category);
        if (pdfFile) formData.append('pdf', pdfFile);

        try {
            const res = await fetch(`${API}/api/admin/courses`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Erreur');
            setTitle('');
            setDescription('');
            setPdfFile(null);
            // Reset file input
            const fileInput = document.getElementById('pdf-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            fetchCourses();
        } catch {
            alert('Erreur lors de l\'ajout du cours');
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async (id: number, currentVisibility: boolean) => {
        await fetch(`${API}/api/admin/courses/${id}/visibility`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ isVisible: !currentVisibility }),
        });
        fetchCourses();
    };

    const deleteCourse = async (id: number) => {
        if (!confirm('Supprimer définitivement ce cours et son PDF ?')) return;
        await fetch(`${API}/api/admin/courses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        setCourses(courses.filter(c => c.id !== id));
    };

    const getCatStyle = (cat: string) => CATEGORIES.find(c => c.key === cat);
    const filtered = filterCat === 'all' ? courses : courses.filter(c => c.category === filterCat);

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-8 text-black font-sans">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        📚 Gestion des Cours
                    </h1>
                    <button
                        onClick={() => router.push('/admin')}
                        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                        <ArrowLeft size={16} /> Retour
                    </button>
                </div>

                {/* FORMULAIRE D'AJOUT */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus size={18} /> Ajouter un cours
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Titre du cours"
                                className="w-full border border-gray-200 p-3 rounded-lg font-bold focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <textarea
                                placeholder="Description (optionnelle)"
                                className="w-full border border-gray-200 p-3 rounded-lg h-24 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catégorie</label>
                            <select
                                className="w-full border border-gray-200 p-3 rounded-lg font-semibold bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fichier PDF</label>
                            <label className="flex items-center gap-2 border border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-gray-400 transition">
                                <Upload size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-500 truncate">
                                    {pdfFile ? pdfFile.name : 'Choisir un fichier PDF...'}
                                </span>
                                <input
                                    id="pdf-input"
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition disabled:bg-gray-400"
                            >
                                {loading ? 'Ajout en cours...' : 'Publier le cours'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* FILTRES */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setFilterCat('all')}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                            filterCat === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        Tout ({courses.length})
                    </button>
                    {CATEGORIES.map(cat => {
                        const count = courses.filter(c => c.category === cat.key).length;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setFilterCat(cat.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                                    filterCat === cat.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {cat.icon} {cat.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* LISTE DES COURS */}
                <div className="space-y-3">
                    {filtered.length > 0 ? filtered.map(course => {
                        const catStyle = getCatStyle(course.category);
                        return (
                            <div
                                key={course.id}
                                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition ${
                                    !course.isVisible ? 'opacity-50 border-dashed' : 'border-gray-100'
                                }`}
                            >
                                {/* Infos */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        {catStyle && (
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catStyle.color}`}>
                                                {catStyle.icon} {catStyle.label}
                                            </span>
                                        )}
                                        {!course.isVisible && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
                                                <EyeOff size={10} /> Masqué
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg truncate">{course.title}</h3>
                                    {course.description && (
                                        <p className="text-gray-500 text-sm truncate">{course.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                        <span>{new Date(course.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        {course.pdfFilename && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <FileText size={12} /> PDF joint
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => toggleVisibility(course.id, course.isVisible)}
                                        className={`p-2.5 rounded-lg transition text-sm font-bold ${
                                            course.isVisible
                                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                        title={course.isVisible ? 'Masquer' : 'Afficher'}
                                    >
                                        {course.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={() => deleteCourse(course.id)}
                                        className="p-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucun cours dans cette catégorie</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
