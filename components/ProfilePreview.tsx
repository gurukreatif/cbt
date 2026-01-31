
import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle, FileText, ShieldCheck, User, MapPin, AtSign, Hash } from 'lucide-react';
import { SchoolProfile } from '../types';

interface ProfilePreviewProps {
  data: SchoolProfile | null;
  onEdit: () => void;
  onDelete: () => void;
  onGoToForm: () => void;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ data, onEdit, onDelete, onGoToForm }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-6 bg-emerald-50 rounded-full mb-6">
          <FileText size={64} className="text-emerald-300" />
        </div>
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Profil sekolah belum dikonfigurasi</h3>
        <p className="text-xs text-gray-400 mt-2 max-w-sm font-bold uppercase">
          Lengkapi data profil sekolah untuk digunakan pada sistem laporan, pengesahan, dan dokumen administrasi ujian.
        </p>
        <button 
          onClick={onGoToForm}
          className="mt-8 px-10 py-3 bg-emerald-700 text-white rounded-sm hover:bg-emerald-800 shadow-xl font-black uppercase text-xs tracking-widest"
        >
          Konfigurasi Sekarang
        </button>
      </div>
    );
  }

  const DataRow = ({ label, value, isZebra }: { label: string; value: string; isZebra?: boolean }) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 border-b border-gray-200 ${isZebra ? 'bg-gray-50/50' : 'bg-white'}`}>
      <div className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r md:border-gray-200">
        {label}
      </div>
      <div className="px-6 py-4 text-xs font-bold text-gray-800 md:col-span-2">
        {value || '—'}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-emerald-700 text-white rounded-sm shadow-sm"><ShieldCheck size={20} /></div>
           <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Status Profil Sekolah Terintegrasi</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-sm hover:bg-black shadow-lg font-black text-[10px] uppercase tracking-widest"
          >
            <Pencil size={14} /> Edit Profil
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-gray-300 shadow-xl overflow-hidden">
        {/* Kop Surat Section */}
        <div className="w-full border-b-2 border-black pb-4">
          {data.kop_surat ? (
            <img src={data.kop_surat} alt="Kop Surat Sekolah" className="w-full h-auto object-contain" />
          ) : (
            <div className="h-24 flex items-center justify-center bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
              Kop surat belum diunggah
            </div>
          )}
        </div>

        {/* Identity Summary Header */}
        <div className="p-10 text-center bg-[#fcfcfc] border-b">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight">{data.nama_sekolah}</h1>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <span className="bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-sm border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">NPSN: {data.school_id}</span>
            <span className="bg-blue-50 text-blue-800 px-4 py-1.5 rounded-sm border border-blue-100 text-[10px] font-black uppercase tracking-widest shadow-sm">Status: {data.status}</span>
            <span className="bg-orange-50 text-orange-800 px-4 py-1.5 rounded-sm border border-orange-100 text-[10px] font-black uppercase tracking-widest shadow-sm">Jenjang: {data.jenjang}</span>
          </div>
        </div>

        {/* Authority Section Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b bg-gray-50">
           <div className="p-6 flex items-center gap-4 border-r border-gray-200">
              <div className="p-3 bg-emerald-700 text-white rounded-sm"><User size={24}/></div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kepala Sekolah</p>
                 <p className="text-sm font-black text-emerald-900">{data.kepala_sekolah || 'Belum Diisi'}</p>
              </div>
           </div>
           <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-700 text-white rounded-sm"><Hash size={24}/></div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">NIP Kepala Sekolah</p>
                 <p className="text-sm font-black text-emerald-900 font-mono">{data.nip_kepala_sekolah || 'Belum Diisi'}</p>
              </div>
           </div>
        </div>

        {/* Detailed Info */}
        <div>
          <DataRow label="Nama Lengkap Satuan Pendidikan" value={data.nama_sekolah} />
          <DataRow label="Alamat Lengkap" value={data.alamat} isZebra />
          <DataRow label="Wilayah Administrasi" value={`${data.kota_kabupaten}, ${data.provinsi}`} />
          <DataRow label="Kode Pos" value={data.kode_pos} isZebra />
          <DataRow label="Informasi Kontak" value={`${data.telepon} • ${data.email}`} />
          <DataRow label="Situs Web" value={data.website} isZebra />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-sm shadow-2xl max-w-md w-full overflow-hidden border border-gray-300">
            <div className="h-1.5 w-full bg-red-600"></div>
            <div className="p-8">
              <div className="flex items-center gap-4 text-red-600 mb-6">
                <AlertCircle size={32} />
                <h3 className="text-xl font-black uppercase tracking-tight">Hapus Data Profil?</h3>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-tight leading-relaxed italic border-l-4 border-red-50 pl-4">
                Peringatan: Seluruh dokumen cetak (Leger, Analisis, Kartu) akan kehilangan identitas sekolah jika data ini dihapus.
              </p>
            </div>
            <div className="bg-gray-50 px-8 py-4 flex justify-end gap-2 border-t">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 text-gray-400 font-black text-[10px] uppercase tracking-widest"
              >
                Batalkan
              </button>
              <button 
                onClick={() => { onDelete(); setShowDeleteModal(false); }}
                className="px-8 py-2 bg-red-600 text-white rounded-sm font-black text-[10px] uppercase tracking-widest shadow-lg"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePreview;