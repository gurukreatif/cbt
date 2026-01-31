
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Check,
  List,
  AlertTriangle,
  X,
  User,
  GraduationCap,
  BookOpen,
  Send,
  FileCheck2
} from 'lucide-react';
import { Question, StudentAnswer, StudentExamSession, ExamResult } from '../types';
import { LOGO_URL } from '../constants';
import { isAnswerCorrect } from '../lib/utils';

interface StudentExamInterfaceProps {
  session: StudentExamSession;
  questions: Question[];
  user: any;
  onFinish: (result: ExamResult) => void;
}

export const StudentExamInterface: React.FC<StudentExamInterfaceProps> = ({ session, questions, user, onFinish }) => {
  const STORAGE_KEY = `emes_exam_state_${session.studentId}_${session.sessionId}`;
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(session.durationMinutes * 60);
  const [showNav, setShowNav] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleSubmit = (status: 'Selesai' | 'Auto-Submit') => {
    // FIX: Explicitly type `a` as StudentAnswer to resolve type inference issue.
    const answeredCount = Object.values(answers).filter((a: StudentAnswer) => a.answer !== null && a.answer !== undefined && String(a.answer).length > 0).length;
    
    let correctCount = 0;
    let score = 0;
    let hasEssay = false;

    questions.forEach(q => {
        if (q.type === 'esai') {
            hasEssay = true;
        } else if (isAnswerCorrect(q, answers[q.id])) {
            correctCount++;
            score += (q.weight || 1);
        }
    });

    const maxScore = questions.filter(q => q.type !== 'esai').reduce((acc, q) => acc + (q.weight || 1), 0);
    const finalGrade = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const result: ExamResult = {
      id: `res_${session.studentId}_${session.sessionId}`,
      school_id: user.school_id,
      session_id: session.sessionId,
      session_name: session.sessionName,
      student_id: session.studentId,
      student_name: session.studentName,
      nis: session.nis,
      start_time: session.loginTime,
      end_time: new Date().toISOString(),
      total_questions: questions.length,
      answered: answeredCount,
      correct: correctCount,
      incorrect: answeredCount - correctCount, // Simplistic, doesn't account for essays
      score,
      max_score: maxScore,
      final_grade: finalGrade,
      is_passed: finalGrade >= session.passingGrade,
      answers: Object.values(answers),
      status: hasEssay ? 'Menunggu Koreksi' : status,
    };
    onFinish(result);
  };
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setCurrentIdx(parsed.currentIdx || 0);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }

    const expiry = new Date(session.expiryTime).getTime();
    const timerId = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
      if (diff === 0) {
        handleSubmit('Auto-Submit');
        clearInterval(timerId);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [session.expiryTime]);

  useEffect(() => {
    const state = { currentIdx, answers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentIdx, answers]);


  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        answer,
        isDoubtful: prev[questionId]?.isDoubtful || false,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const toggleDoubtful = () => {
    const questionId = currentQuestion.id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        answer: prev[questionId]?.answer,
        isDoubtful: !prev[questionId]?.isDoubtful,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans bg-gray-100">
      {/* Header */}
      <header className="h-20 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="Logo" className="h-9 w-9"/>
          <div>
            <h1 className="font-black text-sm text-gray-800 uppercase tracking-tight">{session.sessionName}</h1>
            <p className="text-xs font-bold text-gray-400">{user.nama}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md">
            <Clock size={16} />
            <span className="font-mono font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="px-6 py-3 bg-emerald-700 text-white font-black text-xs uppercase rounded-md shadow-lg flex items-center gap-2">
            <Send size={14}/> Selesai
          </button>
        </div>
      </header>
      
      {/* Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="px-4 py-2 bg-gray-800 text-white font-black text-lg rounded-md">SOAL #{currentIdx + 1}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={answers[currentQuestion.id]?.isDoubtful || false} onChange={toggleDoubtful} className="w-5 h-5"/>
                <span className="text-sm font-bold text-gray-600">Ragu-ragu</span>
              </label>
            </div>
            
            <div className="bg-white p-8 rounded-md border border-gray-200 shadow-sm">
              <div className="editor-content variant-question mb-8" dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />
              {/* Answer options would be rendered here based on question type */}
            </div>
          </div>
        </div>

        {/* Navigation Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Navigasi Soal</h3>
          <div className="flex-1 grid grid-cols-5 gap-2 content-start overflow-y-auto">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered = ans && ans.answer !== null && ans.answer !== undefined && String(ans.answer).length > 0;
              return (
                <button 
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`aspect-square rounded-md font-bold text-lg flex items-center justify-center border-2
                    ${idx === currentIdx ? 'bg-blue-600 text-white border-blue-700' :
                      ans?.isDoubtful ? 'bg-yellow-400 text-black border-yellow-500' :
                      isAnswered ? 'bg-gray-800 text-white border-gray-900' :
                      'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0} className="flex-1 py-3 bg-gray-200 rounded-md font-bold disabled:opacity-50"><ChevronLeft/></button>
            <button onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))} disabled={currentIdx === questions.length - 1} className="flex-1 py-3 bg-gray-200 rounded-md font-bold disabled:opacity-50"><ChevronRight/></button>
          </div>
        </aside>
      </main>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-md shadow-2xl max-w-lg w-full text-center">
             <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4"/>
             <h2 className="text-2xl font-black">Konfirmasi Akhiri Ujian</h2>
             <p className="mt-2 text-gray-600">Apakah Anda yakin ingin menyelesaikan ujian ini? Anda tidak akan dapat mengubah jawaban Anda lagi setelah ini.</p>
             <div className="mt-8 flex gap-4">
               <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-md">Batal</button>
               <button onClick={() => handleSubmit('Selesai')} className="flex-1 py-3 bg-emerald-700 text-white font-bold rounded-md">Ya, Selesaikan</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
