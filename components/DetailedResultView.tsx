import React, { useState, useMemo } from 'react';
import { 
    Check, 
    X, 
    ArrowLeft,
    Award,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { Question, ExamResult, StudentAnswer } from '../types';
import { isAnswerCorrect } from '../lib/utils';

interface DetailedResultViewProps {
  result: ExamResult;
  questions: Question[];
  onBack: () => void;
}

const DetailedResultView: React.FC<DetailedResultViewProps> = ({ result, questions, onBack }) => {
  const answersMap = useMemo(() => {
    const map = new Map<string, StudentAnswer>();
    result.answers.forEach(a => map.set(a.questionId, a));
    return map;
  }, [result.answers]);

  const resultsWithStatus = useMemo(() => {
    return questions.map((q, idx) => ({
      question: q,
      answer: answersMap.get(q.id),
      isCorrect: isAnswerCorrect(q, answersMap.get(q.id)),
      number: idx + 1,
    }));
  }, [questions, answersMap]);
  
  const isAnswered = (ans: any) => ans && ans.answer !== null && ans.answer !== undefined && (Array.isArray(ans.answer) ? ans.answer.length > 0 : typeof ans.answer === 'object' ? Object.keys(ans.answer).length > 0 : String(ans.answer).trim() !== '');

  const getOptionStatus = (question: Question, optionLabel: string, studentAnswer: StudentAnswer | undefined) => {
      const isCorrectOption = question.options?.find(o => o.label === optionLabel)?.isCorrect;
      const userAnswer = studentAnswer?.answer;

      if (question.type === 'pilihan_ganda') {
          if (isCorrectOption) return 'correct';
          if (userAnswer === optionLabel && !isCorrectOption) return 'incorrect';
      }
      if (question.type === 'pilihan_ganda_kompleks' && Array.isArray(userAnswer)) {
          if (isCorrectOption && userAnswer.includes(optionLabel)) return 'correct';
          if (isCorrectOption && !userAnswer.includes(optionLabel)) return 'missed';
          if (!isCorrectOption && userAnswer.includes(optionLabel)) return 'incorrect';
      }
      return 'neutral';
  };

  const renderAnswerDetail = (q: Question, ans: StudentAnswer | undefined) => {
    const userAnswer = ans?.answer;

    switch (q.type) {
      case 'pilihan_ganda':
      case 'pilihan_ganda_kompleks':
        return (
          <div className="space-y-3">
            {q.options?.map(opt => {
              const status = getOptionStatus(q, opt.label, ans);
              const statusClasses = {
                correct: 'border-emerald-500 bg-emerald-50/50',
                incorrect: 'border-red-500 bg-red-50/50',
                missed: 'border-emerald-500 bg-white border-dashed',
                neutral: 'border-gray-200 bg-white'
              };
              return (
                <div key={opt.label} className={`flex items-start gap-3 p-3 border-2 rounded-sm ${statusClasses[status]}`}>
                  <div className="shrink-0 w-8 h-8 rounded-sm border-2 flex items-center justify-center font-bold text-sm bg-white border-gray-300 text-gray-600">{opt.label}</div>
                  <div className="flex-1 editor-content pt-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                  {status === 'correct' && <Check size={18} className="text-emerald-600 shrink-0"/>}
                  {status === 'incorrect' && <X size={18} className="text-red-600 shrink-0"/>}
                </div>
              );
            })}
          </div>
        );
      // Other question types can be added here
      default:
        return <p className="text-xs italic text-gray-400">Tampilan detail untuk tipe soal ini belum tersedia.</p>;
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-100 z-[2000] flex flex-col font-sans">
      <header className="h-20 bg-white flex items-center justify-between px-6 shrink-0 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-sm text-gray-500 transition-colors"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">{result.session_name}</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rincian Hasil Ujian</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skor Akhir</p>
            <p className={`text-3xl font-black ${result.is_passed ? 'text-emerald-600' : 'text-orange-600'}`}>{result.final_grade.toFixed(0)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-sm border border-gray-200">
            <Award size={28} className={result.is_passed ? 'text-emerald-600' : 'text-orange-600'}/>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Nav */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-3 border-b mb-3">Navigasi Soal</h3>
           <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-5 gap-2">
                {resultsWithStatus.map(({ question, isCorrect, answer }, idx) => (
                    <a key={question.id} href={`#q-${question.id}`} className={`aspect-square rounded-sm border-2 font-bold text-sm flex items-center justify-center transition-all ${isCorrect ? 'bg-emerald-600 border-emerald-700 text-white' : !isAnswered(answer) ? 'bg-gray-200 border-gray-300 text-gray-500' : 'bg-red-600 border-red-700 text-white'}`}>
                        {idx + 1}
                    </a>
                ))}
              </div>
           </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
           <div className="max-w-4xl mx-auto space-y-6">
              {resultsWithStatus.map(({ question, answer, isCorrect, number }) => (
                <div id={`q-${question.id}`} key={question.id} className="gov-card bg-white p-6 shadow-sm scroll-mt-24">
                   <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-black text-white ${isCorrect ? 'bg-emerald-600' : !isAnswered(answer) ? 'bg-gray-400' : 'bg-red-600'}`}>{number}</div>
                         <span className="text-xs font-bold text-gray-400 uppercase">Bobot: {question.weight} Poin</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-bold uppercase ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                         {isCorrect ? <CheckCircle2 size={14}/> : <X size={14}/>} {isCorrect ? 'Jawaban Benar' : 'Jawaban Salah'}
                      </div>
                   </div>

                   {/* FIX: Changed questionText to question_text to match type definitions */}
                   <div className="editor-content variant-question mb-6" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                   
                   {renderAnswerDetail(question, answer)}

                   {question.discussion && (
                     <div className="mt-6 border-t border-dashed border-gray-300 pt-4">
                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">Pembahasan</h4>
                        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-sm editor-content variant-option text-sm" dangerouslySetInnerHTML={{ __html: question.discussion }}/>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
};

export default DetailedResultView;