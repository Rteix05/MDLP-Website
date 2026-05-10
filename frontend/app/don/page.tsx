'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Heart, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';

export default function DonationPage() {
    const [amount, setAmount] = useState("10.00");
    const [method, setMethod] = useState<'PAYPAL' | 'STRIPE'>('PAYPAL');
    const [loadingStripe, setLoadingStripe] = useState(false);
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    // Config PayPal
    const paypalOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
        currency: "EUR",
        intent: "capture",
    };

    // --- LOGIQUE PAYPAL ---
    const handlePayPalApprove = async (data: any, actions: any) => {
        const details = await actions.order.capture();
        const token = Cookies.get('token');
        
        try {
            await fetch(`${API}/api/payment/record`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    amount: amount,
                    transactionId: details.id
                })
            });
            alert("Merci ! Paiement PayPal enregistré.");
            router.push('/dashboard');
        } catch (error) {
            console.error("Erreur enregistrement backend", error);
        }
    };

    // --- LOGIQUE STRIPE ---
    const handleStripePayment = async () => {
        setLoadingStripe(true);
        const token = Cookies.get('token');

        try {
            const res = await fetch(`${API}/api/payment/stripe-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Erreur lors de l'initialisation Stripe");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion au serveur");
        } finally {
            setLoadingStripe(false);
        }
    };

    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-[#111] via-[#0a0a0a] to-black font-sans text-gray-900 flex flex-col">
            
            {loadingStripe && <Loader />}

            {/* ================= NAVBAR ================= */}
            <Navbar theme="dark" />

            {/* ================= MAIN CONTENT ================= */}
            <div className="flex-grow flex flex-col items-center justify-center pt-28 pb-12 px-4 md:px-6">
                
                {/* CARTE BLANCHE RESPONSIVE */}
                <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[20px] md:rounded-[30px] shadow-2xl max-w-md w-full text-center border border-gray-100 relative overflow-hidden mt-8 md:mt-0">
                    
                    {/* Effet déco */}
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-bl-[100px] z-0"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                            <Heart size={24} fill="currentColor" />
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Faire un Don</h1>
                        <p className="text-gray-500 mb-8 text-xs md:text-sm font-medium tracking-wide">Soutenez la mission de l'église.</p>

                        {/* 1. Choix du Montant */}
                        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
                            {["10.00", "20.00", "50.00"].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={`py-3 md:py-4 rounded-xl font-bold border-2 transition text-xs md:text-sm ${amount === val ? 'border-black bg-black text-white shadow-md' : 'border-gray-100 text-gray-500 hover:border-black hover:text-black'}`}
                                >
                                    {parseInt(val)}€
                                </button>
                            ))}
                        </div>
                        
                        {/* Montant libre */}
                        <div className="mb-8 relative">
                            <div className="flex items-center border-2 border-gray-100 rounded-xl px-4 focus-within:border-black transition bg-white focus-within:bg-gray-50">
                                <span className="text-gray-400 font-bold text-base md:text-lg">€</span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3 md:p-4 outline-none font-black text-lg md:text-xl text-gray-900 bg-transparent text-center placeholder-gray-300"
                                    placeholder="Autre montant"
                                />
                            </div>
                        </div>

                        {/* 2. Choix de la Méthode */}
                        <div className="flex gap-2 mb-8 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button 
                                onClick={() => setMethod('PAYPAL')}
                                className={`flex-1 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition ${method === 'PAYPAL' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                PayPal
                            </button>
                            <button 
                                onClick={() => setMethod('STRIPE')}
                                className={`flex-1 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition ${method === 'STRIPE' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Carte
                            </button>
                        </div>

                        {/* 3. Boutons de Paiement */}
                        <div className="min-h-[50px] md:min-h-[55px]">
                            {method === 'PAYPAL' ? (
                                <PayPalScriptProvider options={paypalOptions}>
                                    <div className="relative z-0">
                                        <PayPalButtons 
                                            style={{ layout: "vertical", shape: "rect", borderRadius: 12, height: 50, label: "donate" }} 
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    intent: "CAPTURE", 
                                                    purchase_units: [{ amount: { currency_code: "EUR", value: amount } }]
                                                });
                                            }}
                                            onApprove={handlePayPalApprove}
                                        />
                                    </div>
                                </PayPalScriptProvider>
                            ) : (
                                <button 
                                    onClick={handleStripePayment}
                                    disabled={loadingStripe}
                                    className="w-full bg-black hover:bg-gray-800 text-white py-4 md:py-5 rounded-xl font-black shadow-xl shadow-black/10 transition flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-[10px] md:text-xs transform active:scale-95"
                                >
                                    <CreditCard size={18} /> Payer avec Stripe
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <Footer />
        </>
    );
}