
import React from 'react';
import { X, Eye } from 'lucide-react';
import { ExamSchedule, Question } from '../types';

interface PackagePreviewModalProps {
  pkg: ExamSchedule;
  questions: Question[];
  onClose: () => void;
}

const PackagePreviewModal: React.FC<PackagePreviewModalProps> = ({ pkg, questions, onClose }) => {
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-400">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-gray-700 flex items-center gap-2">
            <Eye size={16} /> Pratinjau Paket Ujian
          </h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-lg font-bold">{pkg.name}</h1>
          {/* FIX: Changed questionCount to question_count to match type definition */}
          <p className="text-gray-500 text-sm">Jumlah Soal: {pkg.question_count}</p>
          <div className="mt-8 text-center text-gray-400 italic">
            (Fitur Pratinjau Penuh akan diimplementasikan di sini)
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePreviewModal;
