
import React, { useMemo } from 'react';
import { 
  FileText,
  Calendar,
  Edit,
  User,
  BookOpen,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Teacher, QuestionBank, ExamSession, ExamSchedule, ExamResult } from '../types';

interface TeacherDashboardProps {
  user: Teacher;
  questionBanks: QuestionBank[];
  examSessions: ExamSession[];
  examSchedules: ExamSchedule[];
  examResults: ExamResult[];
  onNavigate: (path: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user,
  questionBanks,
  examSessions,
  examSchedules,
  examResults,
  onNavigate
}) => {

  const teacherData = useMemo(() => {
    const subjects = user.mata_pelajaran || [];
    
    const myBanks = questionBanks.filter(b => subjects.includes(b.subject));
    
    // FIX: Changed supervisorIds to supervisor_ids to match type definition
    const mySupervisingSessions = examSessions.filter(s => 
      s.rooms.some(r => r.supervisor_ids.includes(user.id)) && s.status !== 'Selesai'
    );
    
    // FIX: Changed scheduleId to schedule_id to match type definition
    const mySubjectScheduleIds = new Set(examSchedules.filter(sch => subjects.includes(sch.subject)).map(sch => sch.id));
    const mySubjectSessionIds = new Set(examSessions.filter(s => mySubjectScheduleIds.has(s.schedule_id)).map(s => s.id));
    // FIX: Changed sessionId to session_id to match type definition
    const correctionNeededCount = examResults.filter(r => 
      mySubjectSessionIds.has(r.session_id) && r.status === 'Menunggu Koreksi'
    ).length;

    return {
      myBanks,
      mySupervisingSessions,
      correctionNeededCount
    };
  }, [user, questionBanks, examSessions, examSchedules, examResults]);

  const StatCard = ({ icon, label, value, color, onClick }: any) => (
    <div onClick={onClick} className={`gov-card p-6 border-l-4 ${color} hover:shadow-lg transition-all cursor-pointer`}>
      {icon}
      <h3 className="text-4xl font-black text-gray-800 mt-2">{value}</h3>
      <p className="text-[10px] font-black uppercase text-gray-400">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="gov-card p-6 bg-emerald-800 text-white shadow-lg">
        <h2 className="text-2xl font-black">Selamat Datang, {user.nama.split(' ')[0]}!</h2>
        <p className="text-sm text-emerald-200 mt-1">Ini adalah pusat komando untuk aktivitas mengajar Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<FileText size={20} className="text-blue-700"/>} 
          label="Bank Soal Anda" 
          value={teacherData.myBanks.length}
          color="border-l-blue-600"
          onClick={() => onNavigate('/bank-soal')}
        />
        <StatCard 
          icon={<Calendar size={20} className="text-orange-700"/>} 
          label="Tugas Mengawas" 
          value={teacherData.mySupervisingSessions.length}
          color="border-l-orange-600"
          onClick={() => onNavigate('/pelaksanaan')}
        />
        <StatCard 
          icon={<Edit size={20} className="text-purple-700"/>} 
          label="Menunggu Koreksi" 
          value={teacherData.correctionNeededCount}
          color="border-l-purple-600"
          onClick={() => onNavigate('/koreksi-esai')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="gov-card p-6 bg-white shadow-sm">
           <div className="flex justify-between items-center border-b pb-4 mb-4">
             <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-3"><BookOpen size={16} /> Bank Soal Saya</h3>
             <button onClick={() => onNavigate('/bank-soal')} className="px-4 py-1.5 bg-gray-900 text-white font-black text-[9px] uppercase tracking-widest rounded-sm flex items-center gap-2 hover:bg-black">
                Lihat Semua <ChevronRight size={14}/>
             </button>
           </div>
           <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {teacherData.myBanks.length > 0 ? teacherData.myBanks.map(bank => (
                <div key={bank.id} className="p-4 border border-gray-100 bg-gray-50/50 rounded-sm flex justify-between items-center">
                   <div>
                      <p className="font-black text-gray-800 text-xs uppercase">{bank.subject}</p>
                      {/* FIX: Changed questionCount to question_count to match type definition */}
                      <p className="text-[10px] font-bold text-gray-400">Kelas {bank.level} • {bank.question_count} Soal</p>
                   </div>
                   <button onClick={() => onNavigate('/bank-soal')} className="p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-sm"><Plus size={16}/></button>
                </div>
              )) : <p className="text-center text-xs text-gray-400 py-10">Belum ada bank soal.</p>}
           </div>
        </div>

        <div className="gov-card p-6 bg-white shadow-sm">
           <div className="flex justify-between items-center border-b pb-4 mb-4">
             <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-3"><Calendar size={16} /> Jadwal & Tugas</h3>
           </div>
           <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {teacherData.mySupervisingSessions.length > 0 ? teacherData.mySupervisingSessions.map(session => (
                <div key={session.id} className="p-4 border border-gray-100 bg-gray-50/50 rounded-sm">
                   <p className="font-black text-gray-800 text-xs uppercase">{session.name}</p>
                   {/* FIX: Changed startTime and endTime to match type definitions */}
                   <p className="text-[10px] font-bold text-gray-400">{session.date} • {session.start_time} - {session.end_time}</p>
                </div>
              )) : <p className="text-center text-xs text-gray-400 py-10">Tidak ada jadwal tugas.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
