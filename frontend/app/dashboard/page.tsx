'use client';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, MessageSquare, FileText, Settings, LogOut, Bell, 
    Search, Calendar, Clock, CheckCircle, XCircle, BookOpen, CreditCard, 
    MoreVertical, Trash2, User as UserIcon, Users, Banknote, Download, Home, Menu, X,
    Check, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// --- INTERFACES ---
interface User {
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
}

interface Appointment {
    id: number;
    subject: string;
    date: string;
    status: string;
    pastor: string | null;
    message: string | null;
    meetingType?: string | null;
    user?: {
        firstname: string;
        lastname: string;
        email: string;
        phone?: string;
    };
}

interface AdminStats {
    userCount: number;
    totalRevenue: number;
}

interface Donation {
    id: number;
    amount: number;
    date: string;
    transactionId: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [adminStats, setAdminStats] = useState<AdminStats>({ userCount: 0, totalRevenue: 0 });
    const [userTotalDonation, setUserTotalDonation] = useState(0);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    // --- CHARGEMENT DES DONNÉES ---
    useEffect(() => {
        const token = Cookies.get('token');

        if (!token) {
            router.push('/login');
            return;
        }

        fetch(`${apiUrl}/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 401) throw new Error('Unauthorized');
            if (!res.ok) throw new Error('Erreur récupération user');
            return res.json();
        })
        .then(userData => {
            setUser(userData);
            
            if (userData.roles.includes('ROLE_ADMIN')) {
                fetch(`${apiUrl}/api/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(statsData => {
                    setAdminStats({
                        userCount: statsData.userCount,
                        totalRevenue: statsData.totalRevenue
                    });
                })
                .catch(err => console.error("Erreur stats admin", err));
            } 
            else {
                fetch(`${apiUrl}/api/payment/my-total`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => setUserTotalDonation(data.total))
                .catch(err => console.error("Erreur total user", err));

                fetch(`${apiUrl}/api/payment/my-payments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => setDonations(data))
                .catch(err => console.error("Erreur historique dons", err));
            }

            const endpoint = userData.roles.includes('ROLE_ADMIN') 
                ? `${apiUrl}/api/admin/appointments`
                : `${apiUrl}/api/my-appointments`;

            return fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        })
        .then(res => {
            if (!res || !res.ok) return []; 
            return res.json();
        })
        .then(rdvData => {
            if(Array.isArray(rdvData)) {
                setAppointments(rdvData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            setLoading(false);
        })
        .catch((error) => {
            console.error("Erreur Dashboard:", error);
            if (error.message === 'Unauthorized') {
                Cookies.remove('token');
                router.push('/login');
            } else {
                setLoading(false);
            }
        });
    }, [router, apiUrl]);

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/');
    };

    const updateStatus = async (id: number, newStatus: string) => {
        const token = Cookies.get('token');
        await fetch(`${apiUrl}/api/admin/appointments/${id}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const endpoint = `${apiUrl}/api/admin/appointments`;
        const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setAppointments(data.sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment annuler cette demande ?')) return;
        const token = Cookies.get('token');
        try {
            await fetch(`${apiUrl}/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAppointments(appointments.filter(rdv => rdv.id !== id));
        } catch (err) {
            alert('Impossible de supprimer');
        }
    };

    const downloadInvoice = async (paymentId: number) => {
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${apiUrl}/api/invoice/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 200) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recu_don_${paymentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Erreur lors du téléchargement du reçu.");
            }
        } catch (error) {
            console.error("Erreur téléchargement", error);
            alert("Erreur de connexion serveur.");
        }
    };

    const upcomingAppointments = appointments.filter(rdv => 
        rdv.status === 'CONFIRMED' && new Date(rdv.date) >= new Date()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

    // --- BADGES AUSTIN STONE (Minimalistes) ---
    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'CONFIRMED') return (
            <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-900 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit whitespace-nowrap rounded-lg shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Confirmé
            </span>
        );
        if (status === 'CANCELLED') return (
            <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-900 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit whitespace-nowrap rounded-lg shadow-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Annulé
            </span>
        );
        return (
            <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-900 text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit whitespace-nowrap rounded-lg shadow-sm">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div> En attente
            </span>
        );
    };

    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-900 overflow-hidden">
            {(loading || !user) && <Loader />}
            
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

                    <div className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-lg cursor-pointer shadow-lg shadow-gray-200">
                        <LayoutDashboard size={18} /> 
                        <span className="text-xs font-bold uppercase tracking-widest">Tableau de bord</span>
                    </div>
                    
                    <Link href="/profil" onClick={() => setIsSidebarOpen(false)}>
                        <div className="flex items-center gap-4 p-4 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition group">
                            <UserIcon size={18} className="group-hover:scale-110 transition-transform"/> 
                            <span className="text-xs font-bold uppercase tracking-widest">Mon Profil</span>
                        </div>
                    </Link>

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
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
                    <button className="md:hidden p-2 text-gray-900 hover:bg-gray-50 rounded-lg transition mr-2" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>

                    <div className="hidden sm:flex items-center bg-gray-50 rounded-lg px-4 py-2.5 w-64 md:w-96 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition">
                        <Search size={16} className="text-gray-400 flex-shrink-0"/>
                        <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-xs font-medium ml-3 w-full text-gray-900 placeholder-gray-400 uppercase tracking-wide"/>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 ml-auto">
                        <button className="relative p-2 rounded-full hover:bg-gray-50 transition">
                            <Bell size={20} className="text-gray-400 hover:text-gray-900"/>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-6 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide line-clamp-1">{user?.firstname} {user?.lastname}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isAdmin ? 'Admin' : 'Membre'}</p>
                            </div>
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                {user?.firstname?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- SCROLLABLE CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">

                        {/* TITRE & ACTIONS */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">Bienvenue, {user?.firstname} 👋</h1>
                                <p className="text-gray-500 text-xs md:text-sm font-medium">Gérez votre espace personnel d'ici.</p>
                            </div>
                            
                            <div className="flex gap-3 w-full sm:w-auto">
                                {!isAdmin && (
                                    <button onClick={() => router.push('/planning')} className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-6 py-3.5 md:py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg shadow-black/10 transition transform active:scale-95 text-center">
                                        + Demander un RDV
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* --- WIDGETS --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {/* WIDGET 1 */}
                            <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-auto min-h-[12rem] hover:shadow-md transition duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                            {isAdmin ? "Total Inscrits" : "Cours Suivis"}
                                        </p>
                                        <h3 className="text-3xl md:text-4xl font-black text-gray-900">
                                            {isAdmin ? (adminStats.userCount || "0") : "0"}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl text-black border border-gray-100">
                                        {isAdmin ? <Users size={20} /> : <BookOpen size={20} />}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-50 h-1 mt-6 rounded-full overflow-hidden">
                                    <div className="bg-black h-full w-2/3"></div>
                                </div>
                            </div>

                            {/* WIDGET 2 */}
                            <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-auto min-h-[12rem] hover:shadow-md transition duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                            {isAdmin ? "Dons Récoltés" : "Mes Contributions"}
                                        </p>
                                        <h3 className="text-3xl md:text-4xl font-black text-gray-900">
                                            {isAdmin ? adminStats.totalRevenue : userTotalDonation}€
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl text-black border border-gray-100">
                                        {isAdmin ? <Banknote size={20} /> : <CreditCard size={20} />}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-50 h-1 mt-6 rounded-full overflow-hidden">
                                    <div className="bg-gray-300 h-full w-3/4"></div>
                                </div>
                            </div>

                            {/* WIDGET 3 (AGENDA) */}
                            <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 h-auto min-h-[12rem] relative group hover:shadow-md transition duration-300 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Prochains RDV</h3>
                                    <Calendar size={16} className="text-gray-300"/>
                                </div>
                                
                                {upcomingAppointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 text-gray-300 py-4">
                                        <Calendar size={24} className="mb-2 opacity-20"/>
                                        <p className="text-[10px] font-medium uppercase tracking-wider">Aucun RDV</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {upcomingAppointments.map(rdv => (
                                            <div key={rdv.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-bold text-xs md:text-sm text-gray-900 line-clamp-1">{rdv.subject}</p>
                                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                                                        {new Date(rdv.date).toLocaleDateString('fr-FR')} à {new Date(rdv.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0 ml-2"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <Link href="/planning" className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl md:rounded-2xl">
                                    <span className="bg-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg text-black">Voir agenda</span>
                                </Link>
                            </div>
                        </div>

                        {/* --- ADMIN: NAVIGATION RAPIDE --- */}
                        {isAdmin && (
                            <section>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Accès Rapide</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button onClick={() => router.push('/admin/users')} className="bg-white border border-gray-200 hover:border-black text-gray-900 px-6 py-6 md:py-8 rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3 shadow-sm transition-all duration-300 group">
                                        <Users size={28} className="text-gray-300 group-hover:text-black group-hover:scale-110 transition-all" /> 
                                        Utilisateurs
                                    </button>
                                    <button onClick={() => router.push('/admin/courses')} className="bg-white border border-gray-200 hover:border-black text-gray-900 px-6 py-6 md:py-8 rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3 shadow-sm transition-all duration-300 group">
                                        <BookOpen size={28} className="text-gray-300 group-hover:text-black group-hover:scale-110 transition-all" /> 
                                        Cours
                                    </button>
                                    <button onClick={() => router.push('/admin/payments')} className="bg-white border border-gray-200 hover:border-black text-gray-900 px-6 py-6 md:py-8 rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3 shadow-sm transition-all duration-300 group">
                                        <CreditCard size={28} className="text-gray-300 group-hover:text-black group-hover:scale-110 transition-all" /> 
                                        Paiements
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* --- ADMIN: RDV EN ATTENTE --- */}
                        {isAdmin && (() => {
                            const pending = appointments.filter(a => a.status === 'PENDING');
                            return (
                                <section className="pt-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-md">
                                            <Clock size={14} /> À Traiter
                                        </div>
                                        <span className="text-2xl font-black text-gray-900">{pending.length}</span>
                                    </div>

                                    {pending.length > 0 ? (
                                        <div className="space-y-4">
                                            {pending.map(rdv => (
                                                <div key={rdv.id} className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col lg:flex-row lg:items-center gap-6 transition hover:shadow-md hover:border-black/30">
                                                    <div className="flex-grow min-w-0 space-y-2">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">{rdv.subject}</h3>
                                                            {rdv.pastor && (
                                                                <span className="text-[9px] md:text-[10px] bg-gray-100 text-black px-2.5 py-1 rounded-md font-bold uppercase tracking-widest border border-gray-200">
                                                                    Avec {rdv.pastor}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] md:text-xs text-gray-500 font-medium tracking-wide">
                                                            <span className="flex items-center gap-1.5"><UserIcon size={14}/> {rdv.user ? `${rdv.user.firstname} ${rdv.user.lastname}` : 'Inconnu'}</span>
                                                            {rdv.user?.email && <span className="flex items-center gap-1.5">✉️ {rdv.user.email}</span>}
                                                            {rdv.user?.phone && <span className="flex items-center gap-1.5">📞 {rdv.user.phone}</span>}
                                                            <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(rdv.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                            {rdv.meetingType && (
                                                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                                                    rdv.meetingType === 'presentiel' 
                                                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                                        : 'bg-green-50 text-green-700 border-green-200'
                                                                }`}>
                                                                    {rdv.meetingType === 'presentiel' ? '🏢 Présentiel' : '📞 Téléphonique'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {rdv.message && (
                                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500 italic">
                                                                "{rdv.message}"
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 mt-2 lg:mt-0">
                                                        <button
                                                            onClick={() => updateStatus(rdv.id, 'CONFIRMED')}
                                                            className="flex-1 lg:flex-none flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-3 md:py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition"
                                                        >
                                                            <Check size={14} /> Valider
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(rdv.id, 'CANCELLED')}
                                                            className="flex-1 lg:flex-none flex justify-center items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-3 md:py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition"
                                                        >
                                                            <X size={14} /> Refuser
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle size={20} className="text-gray-300"/>
                                            </div>
                                            <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">Aucun rendez-vous en attente</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })()}

                        {/* --- HISTORIQUE (Tableaux Responsives) --- */}
                        <div className="space-y-8 pt-4">
                            
                            {/* DONS (USER ONLY) */}
                            {!isAdmin && (
                                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="p-4 md:px-8 md:py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] md:text-sm">Historique des dons</h3>
                                        <Link href="/don" className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition border-b border-transparent hover:border-black">Faire un don</Link>
                                    </div>
                                    
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left min-w-[600px]">
                                            <thead className="bg-white text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 md:px-8 py-4 whitespace-nowrap">Date</th>
                                                    <th className="px-6 md:px-8 py-4 whitespace-nowrap">Montant</th>
                                                    <th className="px-6 md:px-8 py-4 whitespace-nowrap">Référence</th>
                                                    <th className="px-6 md:px-8 py-4 text-right whitespace-nowrap">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-xs md:text-sm font-medium text-gray-600 divide-y divide-gray-50">
                                                {donations.length > 0 ? (
                                                    donations.map((don) => (
                                                        <tr key={don.id} className="hover:bg-gray-50 transition">
                                                            <td className="px-6 md:px-8 py-4 whitespace-nowrap">{don.date}</td>
                                                            <td className="px-6 md:px-8 py-4 text-gray-900 font-bold whitespace-nowrap">{don.amount} €</td>
                                                            <td className="px-6 md:px-8 py-4 font-mono text-[10px] md:text-xs text-gray-400 whitespace-nowrap">{don.transactionId}</td>
                                                            <td className="px-6 md:px-8 py-4 text-right">
                                                                <button 
                                                                    onClick={() => downloadInvoice(don.id)}
                                                                    className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-black hover:opacity-70 transition flex items-center gap-2 justify-end ml-auto bg-gray-100 px-3 py-1.5 rounded-lg"
                                                                >
                                                                    <Download size={14} /> PDF
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={4} className="px-6 md:px-8 py-12 text-center text-gray-400 text-[10px] uppercase tracking-widest">Aucun don pour le moment.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* RENDEZ-VOUS */}
                            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="p-4 md:px-8 md:py-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] md:text-sm">
                                        {isAdmin ? "Historique des demandes" : "Mes Rendez-vous"}
                                    </h3>
                                </div>
                                
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left min-w-[700px]">
                                        <thead className="bg-white text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 md:px-8 py-4 whitespace-nowrap">Sujet</th>
                                                {isAdmin && <th className="px-6 md:px-8 py-4 whitespace-nowrap">Demandeur</th>}
                                                <th className="px-6 md:px-8 py-4 whitespace-nowrap">Pasteur</th>
                                                {isAdmin && <th className="px-6 md:px-8 py-4 whitespace-nowrap">Type</th>}
                                                <th className="px-6 md:px-8 py-4 whitespace-nowrap">Date et Heure</th>
                                                <th className="px-6 md:px-8 py-4 whitespace-nowrap">Statut</th>
                                                <th className="px-6 md:px-8 py-4 text-right whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs md:text-sm font-medium text-gray-600 divide-y divide-gray-50">
                                            {appointments.length === 0 ? (
                                                <tr><td colSpan={isAdmin ? 7 : 5} className="px-6 md:px-8 py-12 text-center text-gray-400 text-[10px] uppercase tracking-widest">Aucun rendez-vous trouvé.</td></tr>
                                            ) : (
                                                appointments.map((rdv) => (
                                                    <tr key={rdv.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 md:px-8 py-4 font-bold text-gray-900 whitespace-nowrap">{rdv.subject}</td>
                                                        {isAdmin && <td className="px-6 md:px-8 py-4 whitespace-nowrap">{rdv.user ? `${rdv.user.firstname} ${rdv.user.lastname}` : 'Inconnu'}</td>}
                                                        <td className="px-6 md:px-8 py-4 whitespace-nowrap">{rdv.pastor || '-'}</td>
                                                        {isAdmin && (
                                                            <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                                                                    rdv.meetingType === 'telephonique' 
                                                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                                }`}>
                                                                    {rdv.meetingType === 'telephonique' ? '📞 Téléphonique' : '🏢 Présentiel'}
                                                                </span>
                                                            </td>
                                                        )}
                                                        <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                                            {new Date(rdv.date).toLocaleDateString('fr-FR')} à {new Date(rdv.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="px-6 md:px-8 py-4 whitespace-nowrap"><StatusBadge status={rdv.status} /></td>
                                                        <td className="px-6 md:px-8 py-4 text-right">
                                                            {rdv.status === 'PENDING' && !isAdmin ? (
                                                                <button onClick={() => handleDelete(rdv.id)} className="text-gray-400 hover:text-black transition p-2 bg-gray-50 hover:bg-gray-200 rounded-lg inline-flex"><Trash2 size={16}/></button>
                                                            ) : (
                                                                <button className="text-gray-300 cursor-not-allowed p-2 inline-flex"><MoreVertical size={16}/></button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}