import React, { useEffect } from 'react';
import { SchoolProfile, ExamSchedule, Transaction } from '../types';

export function PrintInvoice({ school, transaction, onDone }: { school: SchoolProfile | null; transaction: Transaction; onDone: () => void; }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      onDone();
    }, 500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const issueDate = new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const dueDate = new Date(transaction.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="invoice-print-area" className="p-0 md:p-12 bg-white min-h-screen text-black font-sans">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body, html { background: white !important; }
          #invoice-print-area { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto p-8 border border-gray-200">
        <div className="flex justify-between items-start border-b-4 border-emerald-700 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase text-emerald-700 tracking-tighter">INVOICE</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">#{transaction.invoice_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">Emes EduTech</h2>
            <p className="text-xs text-gray-600">Jl. Teknologi Pendidikan No. 1<br/>Pontianak, Kalimantan Barat<br/>billing@emes-edutech.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 my-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Ditagihkan Kepada:</p>
            <p className="font-bold text-gray-800">{school?.nama_sekolah}</p>
            <p className="text-xs text-gray-600">{school?.alamat}</p>
            <p className="text-xs text-gray-600">{school?.kota_kabupaten}, {school?.provinsi}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase">Tanggal Terbit: <span className="font-medium text-gray-800">{issueDate}</span></p>
            <p className="text-xs font-bold text-gray-500 uppercase">Jatuh Tempo: <span className="font-medium text-gray-800">{dueDate}</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-xs font-bold uppercase text-gray-600 border-b-2 border-gray-200">Deskripsi</th>
              <th className="p-3 text-xs font-bold uppercase text-gray-600 border-b-2 border-gray-200 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-b border-gray-100">
                <p className="font-bold text-sm text-gray-800">{transaction.description}</p>
              </td>
              <td className="p-3 border-b border-gray-100 text-right font-bold text-sm">Rp {transaction.amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mt-8">
          <div className="w-64">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-gray-600">Subtotal</span>
              <span>Rp {transaction.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-bold text-gray-600">Pajak (0%)</span>
              <span>Rp 0</span>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-emerald-700 flex justify-between text-lg font-black text-emerald-800">
              <span>TOTAL</span>
              <span>Rp {transaction.amount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t text-xs text-gray-500">
          <p className="font-bold">Instruksi Pembayaran:</p>
          <p>Silakan lakukan transfer ke Bank Mandiri <strong>123 456 7890</strong> a.n. Emes CBT Indonesia. Mohon konfirmasi pembayaran melalui email ke billing@emes-edutech.com.</p>
        </div>
      </div>
    </div>
  );
}


export function PrintLedgerNilai({ school, examName, data, onDone }: { school: SchoolProfile | null; examName: string; data: any[]; onDone: () => void; }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      onDone();
    }, 500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const fmt = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
  
  // Ambil tanggal cetak dari data pertama jika ada, atau hari ini sebagai fallback (Leger biasanya kumulatif)
  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="ledger-print-area" className="p-0 md:p-12 bg-white min-h-screen text-black font-serif">
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            @page:first {
              margin-top: 5mm;
            }
            body, html { 
              height: auto !important; 
              overflow: visible !important; 
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            #ledger-print-area {
              display: block !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
            .no-print { display: none !important; }
            table { 
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto;
            }
            tr { page-break-inside: avoid !important; page-break-after: auto; }
            thead { display: table-header-group; }
          }
        `}
      </style>
      
      {school?.kop_surat ? (
        <img src={school.kop_surat} alt="Kop Surat" className="w-full h-auto object-contain mb-8" />
      ) : (
        <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight">{school?.nama_sekolah}</h1>
            <p className="text-xs">{school?.alamat}</p>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-xl font-black tracking-tight">Leger Nilai Hasil Ujian (CBT)</h1>
        <p className="text-sm font-bold mt-1">Ujian: {examName}</p>
        <p className="text-xs mt-1">Tanggal Terbit: {printDate}</p>
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead className="bg-gray-50 font-bold text-center">
          <tr>
            <th className="border border-black p-2 w-10">No</th>
            <th className="border border-black p-2 text-left">Nama Lengkap Peserta</th>
            <th className="border border-black p-2 w-16">Benar</th>
            <th className="border border-black p-2 w-16">Salah</th>
            <th className="border border-black p-2 w-20">Skor Akhir</th>
            <th className="border border-black p-2 w-16">Predikat</th>
            <th className="border border-black p-2 w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r: any, i: number) => (
            <tr key={i}>
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 font-bold">{r.studentName}</td>
              <td className="border border-black p-2 text-center">{r.correct}</td>
              <td className="border border-black p-2 text-center">{r.incorrect}</td>
              <td className="border border-black p-2 text-center font-black">{fmt(r.finalGrade)}</td>
              <td className="border border-black p-2 text-center">{r.finalGrade >= 90 ? 'A' : r.finalGrade >= 80 ? 'B' : r.finalGrade >= 75 ? 'C' : 'D'}</td>
              <td className="border border-black p-2 text-center text-[10px] font-bold">{r.isPassed ? 'Lulus KKM' : 'Remedial'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature Section - Left Aligned Grid */}
      <div className="mt-20 grid grid-cols-2 gap-x-10 px-10 page-break-inside-avoid">
        <div className="text-left"></div>
        <div className="text-left text-xs font-bold mb-1">{school?.kota_kabupaten || '..........'}, {printDate}</div>
        
        <div className="text-left"></div>
        <div className="text-left text-xs font-bold mb-4">Mengetahui,</div>

        <div className="text-left font-bold text-xs">Proktor/Panitia Ujian,</div>
        <div className="text-left font-bold text-xs">Kepala Sekolah</div>

        <div className="h-24"></div>
        <div className="h-24"></div>

        <div className="text-left font-black underline text-xs">..................................................</div>
        <div className="text-left font-black underline text-xs">{school?.kepala_sekolah || '..................................................'}</div>

        <div className="text-left font-bold text-[10px]">NIP. ..................................................</div>
        <div className="text-left font-bold text-[10px]">NIP. {school?.nip_kepala_sekolah || '..................................................'}</div>
      </div>
    </div>
  );
}

export function PrintAnalisisButir({ school, schedule, data, onDone }: { school: SchoolProfile | null; schedule: ExamSchedule; data: any[]; onDone: () => void; }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      onDone();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const fmt = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
  
  // Analisis menggunakan tanggal hari ini sebagai tanggal laporan dibuat
  const reportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="analysis-print-area" className="bg-white min-h-screen text-black font-serif">
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            @page:first {
              margin-top: 5mm;
            }
            body, html { 
              height: auto !important; 
              overflow: visible !important; 
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            #analysis-print-area {
              display: block !important;
              position: static !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
            .no-print { display: none !important; }
            table { 
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: auto !important;
              page-break-inside: auto;
            }
            tr { page-break-inside: avoid !important; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            img { max-width: 100% !important; }
            .page-break-inside-avoid { page-break-inside: avoid !important; }
          }
        `}
      </style>

      <div className="p-0 md:p-12">
        {school?.kop_surat ? (
          <img src={school.kop_surat} alt="Kop Surat" className="w-full h-auto object-contain mb-8" />
        ) : (
            <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-black uppercase tracking-tight">{school?.nama_sekolah}</h1>
                <p className="text-xs">{school?.alamat}</p>
            </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-xl font-black underline">Analisis Butir Soal</h1>
          <p className="text-sm font-bold mt-2">Ujian: {schedule.name}</p>
          <p className="text-xs mt-1">Mata Pelajaran: {schedule.subject} | Kelas: {schedule.level}</p>
        </div>

        <table className="w-full border-collapse border border-black text-[11px]">
          <thead className="bg-gray-100 font-bold text-center">
            <tr>
              <th className="border border-black p-2 w-16">No Soal</th>
              <th className="border border-black p-2 w-16">Kunci</th>
              <th className="border border-black p-2">Jumlah Benar</th>
              <th className="border border-black p-2">Jumlah Salah</th>
              <th className="border border-black p-2">Persentase (%)</th>
              <th className="border border-black p-2">Kesukaran (P)</th>
              <th className="border border-black p-2">Klasifikasi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, i: number) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center font-bold">{item.questionId}</td>
                <td className="border border-black p-2 text-center font-black">{item.key}</td>
                <td className="border border-black p-2 text-center">{item.correct}</td>
                <td className="border border-black p-2 text-center">{item.incorrect}</td>
                <td className="border border-black p-2 text-center">{fmt(item.percentage)}%</td>
                <td className="border border-black p-2 text-center font-mono font-bold">{fmt(item.difficulty)}</td>
                <td className="border border-black p-2 text-center">{item.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 text-[10px] italic font-sans text-gray-600">
          *Keterangan:<br />
          - P &gt; 0.70 : Mudah<br />
          - 0.30 ≤ P ≤ 0.70 : Sedang<br />
          - P &lt; 0.30 : Sukar
        </div>

        {/* Signature Section - Left Aligned Grid */}
        <div className="mt-16 grid grid-cols-2 gap-x-10 px-10 page-break-inside-avoid">
          <div className="text-left"></div>
          <div className="text-left text-xs font-bold mb-1">{school?.kota_kabupaten || '..........'}, {reportDate}</div>
          
          <div className="text-left"></div>
          <div className="text-left text-xs font-bold mb-4">Mengetahui,</div>

          <div className="text-left font-bold text-xs">Petugas Analisis Data,</div>
          <div className="text-left font-bold text-xs">Kepala Sekolah</div>

          <div className="h-24"></div>
          <div className="h-24"></div>

          <div className="text-left font-black underline text-xs">..................................................</div>
          <div className="text-left font-black underline text-xs">{school?.kepala_sekolah || '..................................................'}</div>

          <div className="text-left font-bold text-[10px]">NIP. ..................................................</div>
          <div className="text-left font-bold text-[10px]">NIP. {school?.nip_kepala_sekolah || '..................................................'}</div>
        </div>
      </div>
    </div>
  );
}