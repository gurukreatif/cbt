import React, { useEffect } from 'react';
import { PrintDocType, PrintBaseProps } from './print.types';
import KartuPesertaPrint from './documents/KartuPeserta.print';
import BeritaAcaraPrint from './documents/BeritaAcara.print';
import DaftarHadirPrint from './documents/DaftarHadir.print';

interface PrintProviderProps extends PrintBaseProps {
  type: PrintDocType;
}

const PrintProvider: React.FC<PrintProviderProps> = (props) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      if (props.onDone) props.onDone();
    }, 1000);
    return () => clearTimeout(timer);
  }, [props.onDone, props.type]);

  return (
    <div className="emes-print-provider">
      <div className="no-print" style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', gap: '10px'
      }}>
        <button 
          onClick={() => window.print()}
          style={{ padding: '10px 20px', background: '#064e3b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          CETAK SEKARANG
        </button>
        <button 
          onClick={() => props.onDone?.()}
          style={{ padding: '10px 20px', background: '#111', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          TUTUP
        </button>
      </div>

      <div className="print-content">
        {props.type === 'KARTU' && <KartuPesertaPrint {...props} />}
        {props.type === 'BERITA_ACARA' && <BeritaAcaraPrint {...props} />}
        {props.type === 'DAFTAR_HADIR' && <DaftarHadirPrint {...props} />}
        {props.type === 'MONITORING' && <div className="p-10">Fitur Cetak Monitoring Belum Diimplementasi</div>}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { overflow: visible !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintProvider;