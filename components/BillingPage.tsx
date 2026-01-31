import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import { CreditCard, Zap, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import UpgradeCalculatorModal from './UpgradeCalculatorModal.tsx';

interface BillingPageProps {
  schoolProfile: SchoolProfile | null;
  isSyncing: boolean;
}

const BillingPage: React.FC<BillingPageProps> = ({ schoolProfile, isSyncing }) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const plan = schoolProfile?.plan || 'basic';
  const quotaTotal = schoolProfile?.quota_total || 100;
  const quotaUsed = schoolProfile?.quota_used || 0;
  const quotaRemaining = quotaTotal - quotaUsed;
  const usagePercentage = quotaTotal > 0 ? (quotaUsed / quotaTotal) * 100 : 0;

  const handleUpgradeSubmit = () => {
    setIsUpgradeModalOpen(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {showSuccessMessage && (
        <div className="fixed top-24 right-10 z-[2000] p-4 bg-emerald-600 text-white rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">Permintaan upgrade Anda telah terkirim!</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-700 text-white rounded-sm shadow-sm"><CreditCard size={20} /></div>
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Status Kuota & Billing</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 gov-card p-8 bg-white shadow-lg border-emerald-600 border-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Paket Aktif Saat Ini</p>
              <h3 className={`text-3xl font-black uppercase tracking-tight ${plan === 'pro' ? 'text-emerald-600' : 'text-gray-800'}`}>
                {plan === 'pro' ? 'Profesional' : 'Basic (Free)'}
              </h3>
            </div>
            {plan === 'basic' && (
              <button onClick={() => setIsUpgradeModalOpen(true)} className="px-6 py-2 bg-emerald-600 text-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 shadow-lg">
                <Zap size={14} /> Upgrade Kuota
              </button>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-gray-500">Penggunaan Kuota</span>
              <span className="text-sm font-black text-gray-800">{quotaUsed} / {quotaTotal} <span className="text-xs font-bold text-gray-400">Peserta x Sesi</span></span>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden border border-gray-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
             <p className="text-right text-[10px] text-gray-400 font-bold mt-1">Sisa Kuota: {quotaRemaining}</p>
          </div>
        </div>

        <div className="gov-card p-6 bg-gray-900 text-white flex flex-col items-center justify-center text-center shadow-xl">
          <Star size={24} className="text-amber-400 mb-3" />
          <h4 className="text-sm font-black uppercase tracking-widest">Butuh Kuota Lebih?</h4>
          <p className="text-xs text-gray-300 mt-2">Hitung estimasi biaya sesuai kebutuhan Anda dan ajukan permintaan upgrade.</p>
          <button onClick={() => setIsUpgradeModalOpen(true)} className="mt-4 w-full py-2 bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest rounded-sm flex items-center justify-center gap-2">
            Upgrade Kuota <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      <div className="gov-card p-6 bg-white">
        <h3 className="text-sm font-black uppercase tracking-widest border-b pb-3 mb-4">Riwayat Penggunaan Kuota</h3>
        <p className="text-center py-10 text-xs text-gray-400 font-bold uppercase italic">
          Fitur riwayat penggunaan akan tersedia di versi selanjutnya.
        </p>
      </div>

      {isUpgradeModalOpen && (
        <UpgradeCalculatorModal 
          onClose={() => setIsUpgradeModalOpen(false)}
          onSubmit={handleUpgradeSubmit}
        />
      )}
    </div>
  );
};

export default BillingPage;