'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader';

import { 
    LayoutDashboard, 
    FileText, 
    Settings, 
    LogOut, 
    User as UserIcon,
    Save,
    ArrowLeft,
    Lock,
    Phone,
    Home,
    Calendar,
    Users,
    BookOpen,
    CreditCard,
    Menu,
    X
} from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Données du formulaire
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        phone: '', 
        email: '', 
        // Champs pour le mot de passe
        oldPassword: '',
        newPassword: ''
    });

    // 1. Charger les infos actuelles
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // On appelle la route GET /api/me
        fetch(`${API}/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 401) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
            setFormData(prev => ({
                ...prev,
                firstname: data.firstname || '',
                lastname: data.lastname || '',
                phone: data.phone || '',
                email: data.email || ''
            }));
            setRoles(data.roles || []);
            setLoading(false);
        })
        .catch(() => {
            Cookies.remove('token');
            router.push('/login');
        });
    }, [router]);

    // 2. Fonction de sauvegarde intelligente
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = Cookies.get('token');
        let hasError = false;

        try {
            // --- ACTION A : Mise à jour des infos (Nom, Prénom, Tél) ---
            const resInfo = await fetch(`${API}/api/me/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    phone: formData.phone
                })
            });

            if (!resInfo.ok) hasError = true;

            // --- ACTION B : Mise à jour du mot de passe (si rempli) ---
            if (formData.newPassword && formData.oldPassword) {
                const resPwd = await fetch(`${API}/api/me/password`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        oldPassword: formData.oldPassword,
                        newPassword: formData.newPassword
                    })
                });

                if (!resPwd.ok) {
                    const errorData = await resPwd.json();
                    alert("Erreur mot de passe : " + errorData.message);
                    hasError = true;
                } else {
                    // Si succès, on vide les champs mot de passe
                    setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
                }
            } else if (formData.newPassword || formData.oldPassword) {
                // Si l'un est rempli mais pas l'autre
                alert("Pour changer de mot de passe, remplissez l'ancien ET le nouveau.");
                hasError = true;
            }

            if (!hasError) {
                alert("Profil mis à jour avec succès ! ✅");
            }

        } catch (error) {
            console.error(error);
            alert("Erreur de connexion serveur.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        const token = Cookies.get('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        if (token) {
            try {
                await fetch(`${apiUrl}/api/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                // ignore erreur réseau
            }
        }
        Cookies.remove('token');
        router.push('/');
    };

    const isAdmin = roles.includes('ROLE_ADMIN');

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-900 overflow-hidden">
            {loading && <Loader />}
            
            {/* ================= OVERLAY MOBILE ================= */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-50 md:border-none">
                    <div className="flex items-center gap-2 text-gray-900 text-lg md:text-xl font-black tracking-tighter">
                        MDLP ESPACE
                    </div>
                    <button className="md:hidden text-gray-500 hover:text-black transition" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 md:px-6 space-y-1 mt-4 overflow-y-auto">
                    <Link href="/" onClick={() => setIsSidebarOpen(false)}>
                        <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                            <Home size={18} className="group-hover:scale-110 transition-transform" /> 
                            <span className="text-xs font-bold uppercase tracking-widest">Retour Accueil</span>
                        </div>
                    </Link>

                    <div className="h-px bg-gray-100 my-4 mx-4"></div>

                    <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)}>
                        <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform"/> 
                            <span className="text-xs font-bold uppercase tracking-widest">Tableau de bord</span>
                        </div>
                    </Link>
                    
                    {/* MENU ACTIF (MON PROFIL) */}
                    <div className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-lg cursor-pointer shadow-lg shadow-gray-200">
                        <UserIcon size={18} /> 
                        <span className="text-xs font-bold uppercase tracking-widest">Mon Profil</span>
                    </div>

                    <Link href="/planning" onClick={() => setIsSidebarOpen(false)}>
                        <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                            <Calendar size={18} className="group-hover:scale-110 transition-transform"/> 
                            <span className="text-xs font-bold uppercase tracking-widest">Prendre RDV</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                        <FileText size={18} className="group-hover:scale-110 transition-transform"/> 
                        <span className="text-xs font-bold uppercase tracking-widest">Documents</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                        <Settings size={18} className="group-hover:scale-110 transition-transform"/> 
                        <span className="text-xs font-bold uppercase tracking-widest">Réglages</span>
                    </div>

                    {isAdmin && (
                        <>
                            <div className="h-px bg-gray-100 my-4 mx-4"></div>
                            <p className="px-4 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Administration</p>
                            <Link href="/admin/users" onClick={() => setIsSidebarOpen(false)}>
                                <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                                    <Users size={18} className="group-hover:scale-110 transition-transform"/> 
                                    <span className="text-xs font-bold uppercase tracking-widest">Utilisateurs</span>
                                </div>
                            </Link>
                            <Link href="/admin/courses" onClick={() => setIsSidebarOpen(false)}>
                                <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                                    <BookOpen size={18} className="group-hover:scale-110 transition-transform"/> 
                                    <span className="text-xs font-bold uppercase tracking-widest">Cours</span>
                                </div>
                            </Link>
                            <Link href="/admin/payments" onClick={() => setIsSidebarOpen(false)}>
                                <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                                    <CreditCard size={18} className="group-hover:scale-110 transition-transform"/> 
                                    <span className="text-xs font-bold uppercase tracking-widest">Paiements</span>
                                </div>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition w-full group">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                        <span className="text-xs font-bold uppercase tracking-widest">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 flex flex-col h-full bg-[#FAFAFA] relative w-full overflow-hidden">
                
                {/* --- HEADER --- */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center px-4 md:px-8 flex-shrink-0">
                    <button className="md:hidden p-2 text-gray-900 hover:bg-gray-50 rounded-lg transition mr-2" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">Mon Profil Personnel</h1>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-4xl mx-auto w-full">

                    <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleSave} className="space-y-8">
                            
                            {/* --- SECTION INFOS --- */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4 mb-6">
                                    Mes Informations
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Prénom</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstname}
                                            onChange={e => setFormData({...formData, firstname: e.target.value})}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:border-gray-900 focus:ring-0 outline-none transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Nom</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastname}
                                            onChange={e => setFormData({...formData, lastname: e.target.value})}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:border-gray-900 focus:ring-0 outline-none transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2"><Phone size={14}/> Téléphone</label>
                                        <input 
                                            type="text" 
                                            placeholder="06..."
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:border-gray-900 focus:ring-0 outline-none transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email (Non modifiable)</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            disabled
                                            className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- SECTION SÉCURITÉ --- */}
                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Lock size={16}/> Sécurité
                                </h3>
                                
                                <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Ancien mot de passe</label>
                                            <input 
                                                type="password" 
                                                placeholder="Obligatoire pour changer"
                                                value={formData.oldPassword}
                                                onChange={e => setFormData({...formData, oldPassword: e.target.value})}
                                                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-0 outline-none transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Nouveau mot de passe</label>
                                            <input 
                                                type="password" 
                                                placeholder="Votre nouveau code secret"
                                                value={formData.newPassword}
                                                onChange={e => setFormData({...formData, newPassword: e.target.value})}
                                                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-0 outline-none transition"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-bold">Laissez vide si vous ne souhaitez pas changer de mot de passe.</p>
                                </div>
                            </div>

                            {/* Bouton Save */}
                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg transition transform hover:-translate-y-1 flex items-center gap-3"
                                >
                                    {saving ? 'Sauvegarde...' : <><Save size={18} /> Enregistrer les modifications</>}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
                </div>
            </main>
        </div>
    );
}