
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Key, UserCheck } from 'lucide-react';
import { Teacher, SubjectMaster } from '../types';
import { POSITIONS } from '../constants';

interface TeacherFormProps {
  initialData?: Teacher | null;
  existingNips: string[];
  subjects: SubjectMaster[];
  onSave: (data: Teacher) => void;
  onCancel: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ initialData, existingNips, subjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    nip: '',
    nama: '',
    gelar_depan: '',
    gelar_belakang: '',
    jenis_kelamin: 'Laki-laki',
    mata_pelajaran: [],
    status: 'PNS',
    jabatan: 'Guru Mapel',
    email: '',
    no_hp: '',
    username: '',
    password: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'nip' && !prev.username) {
        next.username = value;
      }
      return next;
    });
  };

  const handleSubjectToggle = (subjectName: string) => {
    setFormData(prev => {
      const current = prev.mata_pelajaran || [];
      const updated = current.includes(subjectName)
        ? current.filter(s => s !== subjectName)
        : [...current, subjectName];
      return { ...prev, mata_pelajaran: updated };
    });
  };

  const validate = () => {
    if (!formData.nip) return "NIP wajib diisi.";
    if (existingNips.includes(formData.nip) && (!initialData || initialData.nip !== formData.nip)) {
      return "NIP sudah terdaftar.";
    }
    if (!formData.nama) return "Nama lengkap wajib diisi.";
    if (!formData.password) return "Password wajib diisi.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const teacherData: Teacher = {
      id: initialData?.id || `guru_${Date.now()}`,
      school_id: initialData?.school_id || '',
      nip: formData.nip!,
      nama: formData.nama!,
      gelar_depan: formData.gelar_depan || '',
      gelar_belakang: formData.gelar_belakang || '',
      jenis_kelamin: formData.jenis_kelamin as any,
      mata_pelajaran: formData.mata_pelajaran!,
      status: formData.status as any,
      jabatan: formData.jabatan as any,
      email: formData.email || '',
      no_hp: formData.no_hp || '',
      username: formData.username || formData.nip!,
      password: formData.password!
    };

    onSave(teacherData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl animate-in zoom-in duration-200 my-8 border border-gray-300">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700 text-white rounded-sm"><UserCheck size={20}/></div>
            <div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                {initialData ? 'Edit Data Pengelola' : 'Tambah Pengelola Baru'}
              </h2>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-sm flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-xs font-bold uppercase">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4 border-b pb-1">Identitas</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">NIP</label>
                    <input required name="nip" value={formData.nip} onChange={handleChange} className="gov-input w-full font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Nama Lengkap</label>
                    <input required name="nama" value={formData.nama} onChange={handleChange} className="gov-input w-full font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Jenis Kelamin</label>
                      <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="gov-input w-full text-xs font-bold uppercase">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Password</label>
                      <input required name="password" value={formData.password} onChange={handleChange} className="gov-input w-full font-mono font-bold" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4 border-b pb-1">Jabatan & Mapel</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Jabatan</label>
                    <select name="jabatan" value={formData.jabatan} onChange={handleChange} className="gov-input w-full text-xs font-bold uppercase">
                      {POSITIONS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 max-h-40 overflow-y-auto">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Mata Pelajaran Diampu</p>
                    {subjects.map(s => (
                      <label key={s.id} className="flex items-center gap-3 p-1 cursor-pointer">
                        <input type="checkbox" checked={formData.mata_pelajaran?.includes(s.nama)} onChange={() => handleSubjectToggle(s.nama)} />
                        <span className="text-[10px] font-bold uppercase">{s.nama}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-sm font-black text-[10px] uppercase">Batal</button>
            <button type="submit" className="px-8 py-2.5 bg-emerald-700 text-white rounded-sm font-black text-[10px] uppercase shadow-lg flex items-center gap-2">
              <Save size={16} /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;