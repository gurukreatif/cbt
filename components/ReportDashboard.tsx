
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Target,
  BookOpen
} from 'lucide-react';
import { ExamSchedule, ExamResult, Question, Student, SchoolProfile } from '../types';
import ResultList from './ResultList.tsx';
import ExamReport from './ExamReport.tsx';
import { isAnswerCorrect } from '../lib/utils.ts';

interface ReportDashboardProps {
  schedule: ExamSchedule;
  results: ExamResult[];
  questions: Question[];
  students: Student[];
  school: SchoolProfile | null;
  onBack: () => void;
  onPrintLeger: (payload: any) => void;
  onPrintAnalysis: (payload: any) => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ 
  schedule, 
  results, 
  questions,
  students,
  school, 
  onBack,
  onPrintLeger,
  onPrintAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'leger' | 'analysis' | 'topic'>('leger');

  const topicAnalysis = useMemo(() => {
    if (!questions || questions.length === 0 || results.length === 0) return [];
    
    const topics = new Map<string, { questionIds: Set<string>, correct: number, total: number }>();
    
    questions.forEach(q => {
      const topic = (q.category || 'TANPA TOPIK').trim().toUpperCase();
      if (!topics.has(topic)) {
        topics.set(topic, { questionIds: new Set(), correct: 0, total: 0 });
      }
      topics.get(topic)!.questionIds.add(q.id);
    });

    results.forEach(result => {
        result.answers.forEach(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            if (question) {
                const topic = (question.category || 'TANPA TOPIK').trim().toUpperCase();
                const topicData = topics.get(topic);
                if (topicData) {
                    topicData.total++;
                    if (isAnswerCorrect(question, answer)) {
                        topicData.correct++;
                    }
                }
            }
        });
    });

    return Array.from(topics.entries()).map(([topic, data]) => {
      const absorption = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      return {
        topic,
        questionCount: data.questionIds.size,
        absorption: Math.round(absorption)
      };
    }).sort((a,b) => b.absorption - a.absorption);

  }, [questions, results]);

  const tabs = [
    { id: 'leger', label: 'Leger Nilai', icon: <FileText size={14} /> },
    { id: 'analysis', label: 'Analisis Butir', icon: <Target size={14} /> },
    { id: 'topic', label: 'Analisis Topik', icon: <BookOpen size={14} /> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-800">
          <ArrowLeft size={14}/> Kembali ke Daftar Laporan
        </button>
      </div>

      <div className="gov-card p-6 bg-white border-l-4 border-l-indigo-700 shadow-md">
         <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{schedule.name}</h2>
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
           {/* FIX: Changed questionCount to question_count to match type definition */}
           {schedule.subject} | KELAS {schedule.level} | {schedule.question_count} SOAL | {schedule.duration} MENIT
         </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-1 flex gap-1">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm transition-all ${
              activeTab === tab.id ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'leger' && (
          <ResultList 
            results={results} 
            students={students} 
            school={school} 
            examName={schedule.name}
            onPrintLeger={onPrintLeger}
          />
        )}
        {activeTab === 'analysis' && (
          <ExamReport 
            schedule={schedule}
            results={results}
            questions={questions}
            school={school}
            onPrintAnalysis={onPrintAnalysis}
          />
        )}
        {activeTab === 'topic' && (
          <div className="gov-card bg-white p-6 shadow-lg">
             <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b pb-4 mb-4">Daya Serap Berdasarkan Topik / Kompetensi Dasar</h3>
             <div className="gov-table-container">
               <table className="gov-table">
                  <thead>
                     <tr>
                        <th>Topik / Kompetensi Dasar</th>
                        <th className="w-32 text-center">Jumlah Soal</th>
                        <th className="w-48 text-center">Rata-Rata Penyerapan</th>
                     </tr>
                  </thead>
                  <tbody>
                     {topicAnalysis.map(item => (
                       <tr key={item.topic}>
                          <td className="font-bold text-xs uppercase text-gray-800">{item.topic.replace(/_/g, ' ')}</td>
                          <td className="text-center font-bold">{item.questionCount}</td>
                          <td>
                            <div className="flex items-center gap-3">
                               <div className="w-full bg-gray-100 rounded-full h-4 border border-gray-200">
                                  <div className={`h-4 rounded-full ${item.absorption > 75 ? 'bg-emerald-500' : item.absorption > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${item.absorption}%`}}></div>
                               </div>
                               <span className="font-black text-sm w-12 text-right">{item.absorption}%</span>
                            </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;
