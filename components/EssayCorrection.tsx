import React, { useState, useMemo, useEffect } from 'react';
import { ExamSession, ExamResult, Question, ExamSchedule } from '../types';
import { ArrowLeft, Edit, User, Check, Save, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface EssayCorrectionProps {
  sessions: ExamSession[];
  results: ExamResult[];
  questions: Question[];
  schedules: ExamSchedule[];
  onSaveResult: (result: ExamResult) => Promise<void>;
  onBack: () => void;
}

const EssayCorrection: React.FC<EssayCorrectionProps> = ({ sessions, results, schedules, questions, onSaveResult }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sessionsNeedingCorrection = useMemo(() => {
    const sessionMap = new Map<string, { session: ExamSession, count: number }>();
    results.forEach(r => {
      if (r.status === 'Menunggu Koreksi') {
        const session = sessions.find(s => s.id === r.session_id);
        if (session) {
          if (!sessionMap.has(session.id)) {
            sessionMap.set(session.id, { session, count: 0 });
          }
          sessionMap.get(session.id)!.count++;
        }
      }
    });
    return Array.from(sessionMap.values());
  }, [sessions, results]);

  const resultsInSession = useMemo(() => {
    if (!selectedSessionId) return [];
    return results.filter(r => r.session_id === selectedSessionId && (r.status === 'Menunggu Koreksi' || r.status === 'Selesai'));
  }, [results, selectedSessionId]);

  const selectedResult = useMemo(() => results.find(r => r.id === selectedResultId), [results, selectedResultId]);
  
  const [essayScores, setEssayScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedResult) {
      const initialScores: Record<string, number> = {};
      selectedResult.answers.forEach(ans => {
        const question = questions.find(q => q.id === ans.questionId);
        if (question?.type === 'esai') {
          initialScores[ans.questionId] = ans.manualScore ?? 0;
        }
      });
      setEssayScores(initialScores);
    } else {
      setEssayScores({});
    }
  }, [selectedResultId, questions]);

  const essayItems = useMemo(() => {
    if (!selectedResult) return [];
    return selectedResult.answers
      .map(ans => ({ answer: ans, question: questions.find(q => q.id === ans.questionId) }))
      .filter((item): item is { answer: typeof item.answer; question: Question } => !!item.question && item.question.type === 'esai');
  }, [selectedResult, questions]);

  const handleSave = async () => {
    if (!selectedResult) return;
    setIsSaving(true);
    try {
      let manualScoreTotal = 0;
      const updatedAnswers = selectedResult.answers.map(ans => {
        const question = questions.find(q => q.id === ans.questionId);
        if (question?.type === 'esai') {
          const score = Math.max(0, Math.min(essayScores[ans.questionId] || 0, question.weight));
          manualScoreTotal += score;
          return { ...ans, manualScore: score, isGraded: true };
        }
        return ans;
      });

      const totalScore = selectedResult.score + manualScoreTotal;
      
      const session = sessions.find(s => s.id === selectedResult.session_id);
      const schedule = schedules.find(s => s.id === session?.schedule_id);
      const sessionQuestions = questions.filter(q => schedule?.question_ids?.includes(q.id));
      const totalMaxScore = sessionQuestions.reduce((sum, q) => sum + q.weight, 0);

      const finalGrade = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      const passingGrade = schedule?.passing_grade || 75;

      const finalResult: ExamResult = {
        ...selectedResult,
        answers: updatedAnswers,
        score: totalScore,
        max_score: totalMaxScore,
        final_grade: finalGrade,
        is_passed: finalGrade >= passingGrade,
        status: 'Selesai'
      };
      
      await onSaveResult(finalResult);
      
      // Move to next student needing correction, or clear selection
      const currentIndex = resultsInSession.findIndex(r => r.id === selectedResultId);
      const nextStudent = resultsInSession.find((r, idx) => idx > currentIndex && r.status === 'Menunggu Koreksi');
      setSelectedResultId(nextStudent?.id || null);

    } catch (e) {
      console.error("Failed to save correction", e);
      alert("Gagal menyimpan koreksi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedSessionId) {
    return (
      <div className="space-y-4 animate-in fade-in">
        <h2 className="text-lg font-bold text-gray-800">Pilih Sesi Ujian untuk Dikoreksi</h2>
        {sessionsNeedingCorrection.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Tidak ada sesi yang menunggu koreksi.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionsNeedingCorrection.map(({session, count}) => (
              <button key={session.id} onClick={() => setSelectedSessionId(session.id)} className="gov-card p-4 text-left hover:border-emerald-500 transition-all">
                <h3 className="font-bold text-sm text-gray-800">{session.name}</h3>
                <p className="text-xs text-gray-500">{session.date}</p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-xs font-bold text-red-600">{count} Peserta Perlu Koreksi</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black rounded-sm">PILIH</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 animate-in fade-in">
      <div className="w-80 bg-white border border-gray-200 rounded-sm flex flex-col">
        <div className="p-4 border-b">
          <button onClick={() => { setSelectedSessionId(null); setSelectedResultId(null); }} className="text-xs font-bold text-gray-500 flex items-center gap-2"><ArrowLeft size={14}/> Kembali ke Sesi</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {resultsInSession.map(r => (
            <button key={r.id} onClick={() => setSelectedResultId(r.id)} className={`w-full text-left p-4 border-b flex items-center justify-between ${selectedResultId === r.id ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
              <div>
                <p className="text-xs font-bold text-gray-800">{r.student_name}</p>
                <p className="text-[10px] text-gray-500">{r.nis}</p>
              </div>
              {r.status === 'Selesai' && <CheckCircle2 size={16} className="text-emerald-500"/>}
              {r.status === 'Menunggu Koreksi' && <Edit size={16} className="text-orange-500"/>}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-sm flex flex-col">
        {selectedResult ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold flex items-center gap-2"><User size={16}/> {selectedResult.student_name}</h3>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-emerald-700 text-white rounded-sm text-xs font-bold flex items-center gap-2 disabled:opacity-50">
                {isSaving ? 'Menyimpan...' : <><Save size={14}/> Simpan & Finalisasi Skor</>}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {essayItems.map(({question, answer}, idx) => (
                <div key={question.id} className="border border-gray-200 rounded-sm p-4">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-500">BUTIR SOAL ESAI #{idx+1}</p>
                    <div className="flex items-center gap-2">
                       <label className="text-xs font-bold">Skor (Max: {question.weight})</label>
                       <input 
                         type="number"
                         value={essayScores[question.id] || ''}
                         onChange={(e) => setEssayScores({...essayScores, [question.id]: parseInt(e.target.value)})}
                         max={question.weight}
                         min={0}
                         className="w-20 p-1 border border-gray-300 rounded-sm text-center font-bold"
                       />
                    </div>
                  </div>
                  {/* FIX: Changed questionText to question_text to match type definitions */}
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-sm editor-content text-sm" dangerouslySetInnerHTML={{__html: question.question_text}}/>
                  
                  <div className="mt-4">
                    <h4 className="text-[10px] font-black text-blue-700 uppercase mb-1">Jawaban Siswa:</h4>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-sm text-sm min-h-[60px]">{String(answer.answer || '-')}</div>
                  </div>

                  {question.discussion && (
                    <div className="mt-4">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-1">Rubrik / Pembahasan:</h4>
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-sm editor-content text-sm" dangerouslySetInnerHTML={{__html: question.discussion}} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
            <User size={48} className="mb-4"/>
            <p className="font-bold">Pilih Siswa dari Daftar</p>
            <p className="text-xs">Pilih seorang siswa dari panel kiri untuk memulai proses koreksi esai.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EssayCorrection;