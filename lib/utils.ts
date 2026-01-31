
import { Question, StudentAnswer } from '../types';

export const isAnswerCorrect = (question: Question, answer: StudentAnswer | undefined): boolean => {
    if (!answer || !answer.answer) return false;
    const userAnswer = answer.answer;

    switch (question.type) {
        case 'pilihan_ganda':
            const correctOpt = question.options?.find(o => o.isCorrect)?.label;
            return userAnswer === correctOpt;

        case 'pilihan_ganda_kompleks':
            const correctOpts = question.options?.filter(o => o.isCorrect).map(o => o.label) || [];
            if (!Array.isArray(userAnswer)) return false;
            // Anggap benar jika set jawaban sama persis
            return correctOpts.length === userAnswer.length && correctOpts.every(opt => userAnswer.includes(opt));
        
        case 'benar_salah':
            if (typeof userAnswer !== 'object' || !question.statements) return false;
            return question.statements.every(stmt => userAnswer[stmt.id] === stmt.isTrue);

        case 'menjodohkan':
            if (typeof userAnswer !== 'object' || !question.matching_pairs) return false;
            return question.matching_pairs.every(p => userAnswer[p.id] === p.rightText);
        
        case 'esai':
            // Manual grading required
            return false;

        default:
            return false;
    }
};

export const stripHtml = (html: string): string => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};