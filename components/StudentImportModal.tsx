
import React, { useState, useRef } from 'react';
import { X, Upload, FileDown, AlertCircle, CheckCircle, Loader2, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, GradeLevel, RombelMaster } from '../types';

interface StudentImportModalProps {
  jenjang: string;
  existingNis: string[];
  gradeLevels: GradeLevel[];
  rombels: RombelMaster[];
  onImport: (data: Student[]) => void;
  onCancel: () => void;
}

interface RowError {
  row: number;
  message: string;
}

// KONTRAK FINAL DATABASE (STRICT) - HANYA DATA IDENTITAS UTAMA
const DB_COLUMNS = [
  'nis', 'nama', 'jenis_kelamin', 'kelas', 'rombel', 'status', 
  'username', 'password'
];

const StudentImportModal: React.FC<StudentImportModalProps> = ({ 
  existingNis, 
  gradeLevels,
  rombels,
  onImport, 
  onCancel 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeGradeNames = gradeLevels.map(g => g.nama.toUpperCase());
  const activeRombelNames = rombels.map(r => r.nama.toUpperCase());

  const downloadTemplate = () => {
    const template = [
      { 
        nis: '12345', 
        nama: 'Ahmad Siswa', 
        jenis_kelamin: 'Laki-laki',
        kelas: gradeLevels[0]?.nama || '7', 
        rombel: rombels[0]?.nama || 'A', 
        status: 'Aktif',
        username: '12345',
        password: 'pass123'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa_STRICT.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsValidating(true);
    setErrors([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Verifikasi Header (Case Sensitive matching database)
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        const missingCols = ['nis', 'nama', 'jenis_kelamin', 'kelas', 'rombel'].filter(c => !headers.includes(c));
        
        if (missingCols.length > 0) {
          throw new Error(`HEADER DATABASE TIDAK LENGKAP: ${missingCols.join(', ')}`);
        }

        const json: any[] = XLSX.utils.sheet_to_json(worksheet);
        validateData(json);
      } catch (err: any) {
        setErrors([{ row: 0, message: err.message }]);
      } finally { setIsValidating(false); }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (data: any[]) => {
    const newErrors: RowError[] = [];
    const processed: any[] = [];
    const currentNisSet = new Set<string>();

    data.forEach((row, index) => {
      const rowIndex = index + 2;
      const nis = String(row.nis || '').trim();
      const nama = String(row.nama || '').trim();
      const jk = String(row.jenis_kelamin || '').trim();
      const kls = String(row.kelas || '').trim().toUpperCase();
      const rmb = String(row.rombel || '').trim().toUpperCase();

      let rowHasError = false;

      if (!nis) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: nis kosong.` }); rowHasError = true; }
      else if (existingNis.includes(nis)) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: nis ${nis} terdaftar.` }); rowHasError = true; }
      else if (currentNisSet.has(nis)) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: nis ${nis} duplikat.` }); rowHasError = true; }
      currentNisSet.add(nis);

      if (!nama) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: nama kosong.` }); rowHasError = true; }
      if (!['Laki-laki', 'Perempuan'].includes(jk)) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: jenis_kelamin tidak valid.` }); rowHasError = true; }
      if (!activeGradeNames.includes(kls)) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: kelas tidak ada di master.` }); rowHasError = true; }
      if (!activeRombelNames.includes(rmb)) { newErrors.push({ row: rowIndex, message: `B${rowIndex}: rombel tidak ada di master.` }); rowHasError = true; }

      processed.push({ ...row, _isValid: !rowHasError });
    });

    setPreviewData(processed);
    setErrors(newErrors);
  };

  const handleImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const students: Student[] = previewData.filter(r => r._isValid).map(row => {
        const studentObj: any = {
          id: `siswa_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // MAPPING KETAT: Hanya kolom yang ada di DB_COLUMNS
        DB_COLUMNS.forEach(col => {
          studentObj[col] = row[col] !== undefined ? String(row[col]) : (col === 'status' ? 'Aktif' : (col === 'username' ? row.nis : ''));
        });

        return studentObj as Student;
      });
      
      onImport(students);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-200 animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b shrink-0 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-sm"><FileSpreadsheet size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Import Identitas Siswa</h2>
              <p className="text-xs text-red-600 font-black uppercase">Database Enrollment-Free Mode</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full text-gray-400"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 bg-gray-50 rounded-sm border-2 border-dashed border-gray-200 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">{file ? file.name : 'Format: .XLSX'}</h3>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-gray-900 text-white rounded-sm font-bold text-xs uppercase tracking-widest">Pilih File</button>
            </div>

            <div className="bg-white border-2 border-red-50 rounded-sm p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-red-500" /><h4 className="text-xs font-black text-gray-800 uppercase">Ketentuan Database</h4></div>
              <ul className="text-[10px] text-gray-600 space-y-2 flex-1 font-bold uppercase">
                <li>• Nama kolom (Header) harus huruf kecil & identik.</li>
                <li>• Kolom <span className="text-red-600">nis, nama, jenis_kelamin, kelas, rombel</span> WAJIB ada.</li>
                <li>• Data penempatan ruang/sesi diabaikan karena dikelola di modul Jadwal Sesi.</li>
              </ul>
              <button onClick={downloadTemplate} className="mt-6 w-full py-3 bg-red-600 text-white rounded-sm font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg">
                <FileDown size={18} /> Download Strict Template
              </button>
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase border-b pb-2">Preview Integrasi ({previewData.length} baris)</h3>
              <div className="border border-gray-200 rounded-sm overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 uppercase font-black text-gray-500">NIS</th>
                      <th className="px-4 py-2 uppercase font-black text-gray-500">Nama</th>
                      <th className="px-4 py-2 uppercase font-black text-gray-500">Kls-Rmb</th>
                      <th className="px-4 py-2 uppercase font-black text-gray-500 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.map((row, i) => (
                      <tr key={i} className={row._isValid ? '' : 'bg-red-50'}>
                        <td className="px-4 py-2 font-mono font-bold">{row.nis}</td>
                        <td className="px-4 py-2 font-bold uppercase">{row.nama}</td>
                        <td className="px-4 py-2 uppercase font-bold text-emerald-700">{row.kelas}-{row.rombel}</td>
                        <td className="px-4 py-2 text-center">
                          {row._isValid ? <CheckCircle size={14} className="text-emerald-500 mx-auto" /> : <AlertCircle size={14} className="text-red-500 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-sm">
              <p className="text-xs font-black text-red-800 uppercase mb-2">Schema Mismatch Log:</p>
              {errors.map((e, i) => <p key={i} className="text-[10px] text-red-600 font-bold">• {e.message}</p>)}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} className="px-6 py-2.5 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100">Batal</button>
          <button 
            disabled={previewData.filter(d => d._isValid).length === 0 || isProcessing} 
            onClick={handleImport} 
            className="px-10 py-2.5 bg-emerald-700 text-white rounded-sm font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Konfirmasi Sync Database
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentImportModal;