'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
    ChevronLeft, ChevronRight, Clock, MapPin, Video, ArrowLeft, Check, Users, Globe, Phone, Building2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';

// --- DONNÉES DES PASTEURS ---
const pastors = [
  { 
    id: 'pastor1', 
    name: 'Samuel PANZU', 
    role: 'Pasteur Principal', 
    image: 'https://ui-avatars.com/api/?name=SP&background=111827&color=fff&size=128',
    desc: 'Pour un accompagnement spirituel approfondi.'
  },
  { 
    id: 'pastor2', 
    name: 'Filomena PANZU', 
    role: 'Pasteur', 
    image: 'https://ui-avatars.com/api/?name=FP&background=4b5563&color=fff&size=128',
    desc: 'Idéal pour les questions liées aux Femmes et au foyer.'
  },
  { 
    id: 'both', 
    name: 'Couple Pastoral', 
    role: 'Entretien Conjoint', 
    icon: <Users className="w-6 h-6 text-gray-900"/>,
    desc: 'Pour les situations complexes nécessitant plusieurs avis.',
    isSpecial: true
  }
];

export default function PlanningPage() {
  const router = useRouter();
  
  // États
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFullDate, setSelectedFullDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(0); 
  const [selectedPastor, setSelectedPastor] = useState<string | null>(null);
  const [meetingType, setMeetingType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Charger les créneaux confirmés
  useEffect(() => {
    fetch(`${API}/api/appointments/blocked-slots`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBlockedSlots(data); })
      .catch(err => console.error('Erreur blocked slots:', err));
  }, []);

  // Logique Calendrier
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstDayIndex = new Date(year, month, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() <= today.getFullYear()) return; 
    setCurrentDate(newDate);
    setSelectedFullDate(null);
    setStep(0);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedFullDate(null);
    setStep(0);
  };

  const getFormattedDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  };

  const handleDateClick = (date: Date) => {
      setSelectedFullDate(date);
      setSelectedTime(null);
      setStep(0);
      setSelectedPastor(null);
      setMeetingType(null);
  };

  const handleConfirm = async () => {
    const token = Cookies.get('token');

    if (!token) {
        alert("Vous devez être connecté pour prendre rendez-vous !");
        router.push('/login');
        return;
    }

    if (!selectedFullDate || !selectedTime || !selectedPastor || !meetingType) return;

    setLoading(true);

    const year = selectedFullDate.getFullYear();
    const month = String(selectedFullDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedFullDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${selectedTime}`;
    const pastorName = pastors.find(p => p.id === selectedPastor)?.name || 'Non spécifié';

    try {
        const res = await fetch(`${API}/api/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subject: 'Entretien Pastoral',
                date: formattedDate,
                pastor: pastorName,
                meetingType: meetingType,
                message: `Réservé via le Planning en ligne (${meetingType === 'presentiel' ? 'Présentiel' : 'Téléphonique'})`
            })
        });

        if (res.ok) {
            router.push('/dashboard');
        } else {
            const errorData = await res.json();
            alert('Erreur : ' + (errorData.message || 'Impossible de réserver'));
        }
    } catch (err) {
        console.error(err);
        alert('Erreur de connexion au serveur');
    } finally {
        setLoading(false);
    }
  };

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Notre beau Loader Global */}
      {loading && <Loader />}

      {/* ================= NAVBAR GLOBALE ================= */}
      <Navbar theme="light" />

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow pt-28 pb-12 px-4 md:px-6 flex justify-center items-center">
        
        <div className="bg-white rounded-[20px] md:rounded-[30px] shadow-2xl border border-gray-100 flex flex-col lg:flex-row w-full max-w-6xl overflow-hidden min-h-[600px]">
            
            {/* INFO GAUCHE */}
            <div className="w-full lg:w-1/3 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col relative bg-gray-50/50">
                <div className="mb-8">
                    <div className="h-12 w-12 md:h-14 md:w-14 bg-black rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl mb-6 shadow-lg">M</div>
                    <h3 className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2">Montagne de la Prière</h3>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">Entretien <br/>Pastoral</h1>
                </div>

                <div className="space-y-4 md:space-y-5 text-gray-600 text-xs md:text-sm">
                    <div className="flex items-center gap-4 group">
                        <div className="p-2 bg-white rounded-lg border border-gray-200"><Clock className="w-4 h-4 text-gray-900" /></div>
                        <span className="font-bold uppercase tracking-wide">30 min</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="p-2 bg-white rounded-lg border border-gray-200"><Video className="w-4 h-4 text-gray-900" /></div>
                        <span className="font-bold uppercase tracking-wide">Visioconférence (Zoom)</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="p-2 bg-white rounded-lg border border-gray-200"><MapPin className="w-4 h-4 text-gray-900" /></div>
                        <span className="font-bold uppercase tracking-wide">Noisy-Le-Grand</span>
                    </div>
                </div>
                
                {/* Récapitulatif visible si sélection effectuée */}
                {selectedFullDate && selectedTime && (
                    <div className="mt-8 pt-8 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Votre sélection</p>
                        <p className="font-black text-lg md:text-xl text-gray-900 capitalize leading-tight">{getFormattedDate(selectedFullDate)}</p>
                        <p className="text-gray-500 font-medium text-sm mb-4">à {selectedTime}</p>
                        {selectedPastor && (
                             <div className="text-[10px] md:text-xs font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                                <Check size={14} className="text-green-600 flex-shrink-0"/>
                                <span className="uppercase tracking-wide line-clamp-1">{pastors.find(p => p.id === selectedPastor)?.name}</span>
                             </div>
                        )}
                        {meetingType && (
                             <div className="text-[10px] md:text-xs font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 mt-2">
                                {meetingType === 'presentiel' ? <Building2 size={14} className="text-blue-600 flex-shrink-0"/> : <Phone size={14} className="text-green-600 flex-shrink-0"/>}
                                <span className="uppercase tracking-wide">{meetingType === 'presentiel' ? 'Présentiel' : 'Téléphonique'}</span>
                             </div>
                        )}
                    </div>
                )}
            </div>

            {/* CALENDRIER (Caché sur mobile si une date est choisie) */}
            <div className={`w-full lg:w-1/3 p-6 md:p-8 ${selectedFullDate ? 'hidden lg:block lg:border-r border-gray-100' : 'block'}`}>
                <h2 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 md:mb-8 border-b border-gray-100 pb-4">Sélectionner une date</h2>
                
                <div className="flex justify-between items-center mb-6 px-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-900 transition disabled:opacity-30"><ChevronLeft size={18}/></button>
                    <span className="font-black text-base md:text-lg text-gray-900 uppercase tracking-wide">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-900 transition"><ChevronRight size={18}/></button>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[9px] md:text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-wider">
                    {dayNames.map(d => <span key={d}>{d}</span>)}
                </div>
                
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} className="h-10 w-full"></div>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const thisDate = new Date(year, month, dayNum);
                        const isSelected = selectedFullDate?.toDateString() === thisDate.toDateString();
                        const isToday = thisDate.toDateString() === today.toDateString();
                        const isPast = thisDate < today;
                        const dayOfWeek = thisDate.getDay(); // 2=Mardi, 4=Jeudi
                        const isNotAllowed = dayOfWeek !== 2 && dayOfWeek !== 4;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const slotsForDay = blockedSlots.filter(s => s.startsWith(dateStr));
                        const isFullyBooked = slotsForDay.length >= timeSlots.length;
                        const isDisabled = isPast || isNotAllowed || isFullyBooked;

                        return (
                            <div key={dayNum} className="flex justify-center items-center h-10 md:h-12 w-full">
                                <button
                                    disabled={isDisabled}
                                    onClick={() => handleDateClick(thisDate)}
                                    className={`
                                        h-9 w-9 md:h-10 md:w-10 rounded-full md:rounded-lg flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-200
                                        ${isDisabled ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-700'}
                                        ${isSelected ? '!bg-black !text-white shadow-md scale-110' : ''}
                                        ${isToday && !isSelected ? 'text-black border-b-2 border-black' : ''}
                                        ${isNotAllowed && !isPast ? 'line-through text-gray-300' : ''}
                                        ${isFullyBooked && !isPast && !isNotAllowed ? 'bg-red-50 text-red-300' : ''}
                                    `}
                                    title={isNotAllowed ? 'Disponible uniquement le Mardi et le Jeudi' : isFullyBooked ? 'Tous les créneaux sont pris' : ''}
                                >
                                    {dayNum}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 pt-4 border-t border-gray-50 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-center">
                    <Globe size={12} /> Europe/Paris (CET)
                </div>
            </div>

            {/* COLONNE DROITE (HEURE & PASTEUR) */}
            {selectedFullDate && (
                <div className="w-full lg:w-1/3 p-6 md:p-8 bg-white animate-in slide-in-from-right-8 duration-300 relative flex flex-col min-h-[400px]">
                    
                    {/* Bouton Retour Mobile pour revenir au calendrier */}
                    <button 
                        onClick={() => { setSelectedFullDate(null); setStep(0); }} 
                        className="lg:hidden flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black mb-6 uppercase tracking-widest transition border-b border-gray-100 pb-4"
                    >
                        <ArrowLeft size={14}/> Modifier la date
                    </button>

                    {/* ÉTAPE 1 : HEURE */}
                    {step === 0 && (
                        <>
                            <h2 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4 hidden lg:block">
                                Horaires disponibles
                            </h2>
                            <div className="space-y-2 md:space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                {timeSlots.map((time) => {
                                    const isActive = selectedTime === time;
                                    const dateStr = selectedFullDate ? `${selectedFullDate.getFullYear()}-${String(selectedFullDate.getMonth() + 1).padStart(2, '0')}-${String(selectedFullDate.getDate()).padStart(2, '0')}` : '';
                                    const isSlotTaken = blockedSlots.includes(`${dateStr} ${time}`);
                                    if (isSlotTaken) return (
                                        <div key={time} className="py-3 md:py-4 rounded-xl font-bold text-xs md:text-sm border-2 border-gray-100 bg-gray-50 text-gray-300 text-center cursor-not-allowed">
                                            {time} — Indisponible
                                        </div>
                                    );
                                    return (
                                        <div key={time} className="flex gap-2 transition-all duration-300">
                                            <button
                                                onClick={() => setSelectedTime(time)}
                                                className={`flex-grow py-3 md:py-4 rounded-xl font-bold text-xs md:text-sm border-2 transition-all duration-200 ${isActive ? 'bg-black text-white border-black w-1/2 md:w-2/3' : 'bg-white text-gray-700 border-gray-100 hover:border-black w-full'}`}
                                            >
                                                {time}
                                            </button>
                                            {isActive && (
                                                <button 
                                                    onClick={() => setStep(1)}
                                                    className="w-1/2 md:w-1/3 bg-black text-white rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center animate-in fade-in zoom-in duration-200 hover:scale-105 transition-transform"
                                                >
                                                    Suivant
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ÉTAPE 2 : PASTEUR */}
                    {step === 1 && (
                        <div className="h-full flex flex-col">
                            <button onClick={() => setStep(0)} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black mb-6 uppercase tracking-widest transition">
                                <ArrowLeft size={14}/> Changer l'heure
                            </button>

                            <h2 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Avec qui ?</h2>
                            
                            <div className="space-y-3 flex-grow">
                                {pastors.map((pastor) => {
                                    const isSelected = selectedPastor === pastor.id;
                                    return (
                                        <div 
                                            key={pastor.id}
                                            onClick={() => setSelectedPastor(pastor.id)}
                                            className={`
                                                cursor-pointer rounded-xl border-2 p-3 md:p-4 transition-all duration-200 flex items-center gap-3 md:gap-4
                                                ${isSelected ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-black'}
                                            `}
                                        >
                                            <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 ${pastor.isSpecial ? 'bg-white' : 'bg-gray-100'}`}>
                                                {pastor.isSpecial ? pastor.icon : <img src={pastor.image} alt={pastor.name} className="h-full w-full object-cover"/>}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className={`font-black text-xs md:text-sm uppercase tracking-wide ${isSelected ? 'text-black' : 'text-gray-800'}`}>{pastor.name}</h3>
                                                <p className="text-[10px] md:text-xs text-gray-500 font-medium line-clamp-1">{pastor.role}</p>
                                            </div>
                                            <div className={`h-5 w-5 md:h-6 md:w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                                                {isSelected && <Check size={12} strokeWidth={4} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedPastor && (
                                <button 
                                    onClick={() => setStep(2)}
                                    className="mt-6 w-full bg-black text-white py-4 md:py-5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] shadow-xl shadow-black/10 transition-transform transform active:scale-95 flex justify-center items-center"
                                >
                                    Suivant
                                </button>
                            )}
                        </div>
                    )}

                    {/* ÉTAPE 3 : TYPE DE RDV */}
                    {step === 2 && (
                        <div className="h-full flex flex-col">
                            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black mb-6 uppercase tracking-widest transition">
                                <ArrowLeft size={14}/> Changer le pasteur
                            </button>

                            <h2 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Type de rendez-vous</h2>
                            
                            <div className="space-y-3 flex-grow">
                                <div className="rounded-xl border-2 border-gray-100 p-4 md:p-5 flex items-center gap-4 opacity-50 cursor-not-allowed bg-gray-50">
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <Building2 size={22} className="text-gray-400" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-black text-sm uppercase tracking-wide text-gray-400">Présentiel</h3>
                                        <p className="text-[10px] md:text-xs text-gray-400 font-medium italic">Non disponible pour l'instant</p>
                                    </div>
                                    <div className="h-6 w-6 rounded-full border-2 border-gray-200"></div>
                                </div>

                                <div 
                                    onClick={() => setMeetingType('telephonique')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 md:p-5 transition-all duration-200 flex items-center gap-4 ${meetingType === 'telephonique' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-black'}`}
                                >
                                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                        <Phone size={22} className="text-green-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className={`font-black text-sm uppercase tracking-wide ${meetingType === 'telephonique' ? 'text-black' : 'text-gray-800'}`}>Téléphonique</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-medium">Par appel téléphonique</p>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${meetingType === 'telephonique' ? 'border-black bg-black text-white' : 'border-gray-200'}`}>
                                        {meetingType === 'telephonique' && <Check size={12} strokeWidth={4} />}
                                    </div>
                                </div>
                            </div>

                            {meetingType && (
                                <button 
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="mt-6 w-full bg-black text-white py-4 md:py-5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] shadow-xl shadow-black/10 transition-transform transform active:scale-95 flex justify-center items-center"
                                >
                                    Confirmer le RDV
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      <Footer />

    </div>
  );
}