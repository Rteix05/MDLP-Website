'use client';

import { useState, useEffect } from 'react';
import { Download, BookOpen, GraduationCap, Church, Filter, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Category = 'all' | 'ecole-dimanche' | 'cours-specifiques' | 'messes-dimanche';

interface Course {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  hasPdf: boolean;
}

const categories: { key: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'all', label: 'Tout', icon: <Filter size={16} />, color: 'bg-gray-900 text-white' },
  { key: 'ecole-dimanche', label: 'École du Dimanche', icon: <BookOpen size={16} />, color: 'bg-amber-500 text-white' },
  { key: 'cours-specifiques', label: 'Cours Spécifiques', icon: <GraduationCap size={16} />, color: 'bg-blue-600 text-white' },
  { key: 'messes-dimanche', label: 'Présentations du Dimanche', icon: <Church size={16} />, color: 'bg-purple-600 text-white' },
];

const categoryStyles: Record<string, { badge: string; accent: string }> = {
  'ecole-dimanche': { badge: 'bg-amber-100 text-amber-700', accent: 'border-amber-400' },
  'cours-specifiques': { badge: 'bg-blue-100 text-blue-700', accent: 'border-blue-500' },
  'messes-dimanche': { badge: 'bg-purple-100 text-purple-700', accent: 'border-purple-500' },
};

export default function CoursPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetch(`${API}/api/courses`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement');
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setCourses(data); })
      .catch(() => setError('Impossible de charger les cours. Veuillez réessayer.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all' ? courses : courses.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar theme="light" />

      {/* ================= HEADER ================= */}
      <header className="pt-40 pb-16 px-6 bg-white text-center">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Enseignements</h3>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight uppercase">
          Les Cours de l&apos;Église
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
          Retrouvez toutes les présentations et supports de cours utilisés lors de nos enseignements.
        </p>
      </header>

      {/* ================= FILTRES PAR CATÉGORIE ================= */}
      <section className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300
                ${activeCategory === cat.key
                  ? cat.color + ' shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ================= LISTE DES COURS ================= */}
      <section className="pb-32 pt-12 px-6">
        <div className="max-w-5xl mx-auto">

          {loading ? (
            <div className="flex justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-red-500 font-semibold mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition">
                Réessayer
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => {
                const style = categoryStyles[course.category] || categoryStyles['cours-specifiques'];
                const catLabel = categories.find(c => c.key === course.category)?.label;
                return (
                  <div
                    key={course.id}
                    className={`bg-white rounded-2xl border-t-4 ${style.accent} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden`}
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-4 ${style.badge}`}>
                        {catLabel}
                      </span>

                      <h2 className="text-lg font-black text-gray-900 uppercase leading-tight mb-2">
                        {course.title}
                      </h2>

                      <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-grow">
                        {course.description}
                      </p>

                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-5">
                        {new Date(course.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>

                      {course.hasPdf ? (
                        <a
                          href={`${API}/api/courses/${course.id}/download`}
                          className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition active:scale-[0.98]"
                        >
                          <Download size={14} /> Télécharger
                        </a>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                          Bientôt disponible
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest">Aucun cours dans cette catégorie.</p>
            </div>
          )}

        </div>
      </section>

      <Footer />

    </div>
  );
}