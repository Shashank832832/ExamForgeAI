import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getResultById } from '../services/examService';
import { explainQuestionSolution, generateSimilarQuestion } from '../services/ocrService';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Award, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Sparkles, 
  BrainCircuit,
  Loader2, 
  ArrowLeft 
} from 'lucide-react';

export default function ResultPage() {
  const { attemptId } = useParams();
  const [activeQuestionReviewIndex, setActiveQuestionReviewIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Load Result stats from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['attemptResult', attemptId],
    queryFn: () => getResultById(attemptId),
  });

  // Fallback Mockup Data for standalone UI sandbox testing
  const fallbackResult = {
    examId: { title: 'JEE Main Full Physics Test' },
    score: 68,
    maxMarks: 100,
    accuracy: 72,
    totalQuestions: 25,
    attempted: 18,
    unattempted: 7,
    correct: 13,
    wrong: 5,
    subjectAnalysis: [
      { subject: 'Mechanics', score: 28, maxMarks: 40, accuracy: 70 },
      { subject: 'Electromagnetism', score: 24, maxMarks: 40, accuracy: 80 },
      { subject: 'Thermodynamics', score: 16, maxMarks: 20, accuracy: 65 }
    ],
    difficultyAnalysis: [
      { name: 'Easy', correct: 8, wrong: 1 },
      { name: 'Medium', correct: 4, wrong: 2 },
      { name: 'Hard', correct: 1, wrong: 2 }
    ],
    questions: [
      {
        _id: 'q1',
        questionNumber: 1,
        subject: 'Physics',
        type: 'single',
        question: 'Identify the dimensions of self-inductance $L$ in terms of basic SI units:',
        options: [
          '$\\text{M}^2 \\text{L}^2 \\text{T}^{-2} \\text{A}^{-2}$',
          '$\\text{M} \\text{L}^2 \\text{T}^{-2} \\text{A}^{-2}$',
          '$\\text{M} \\text{L}^2 \\text{T}^{-1} \\text{A}^{-2}$',
          '$\\text{M} \\text{L}^2 \\text{T}^{-2} \\text{A}^{-1}$'
        ],
        correctAnswer: [1], // Code index 1 (Option B)
        solution: 'Self inductance is given by $U = \\frac{1}{2} L I^2 \\implies L = \\frac{2U}{I^2}$. Dimension of energy $U$ is $[\\text{M} \\text{L}^2 \\text{T}^{-2}]$ and current $I$ is $[\\text{A}]$. Therefore, $[L] = [\\text{M} \\text{L}^2 \\text{T}^{-2} \\text{A}^{-2}]$.'
      },
      {
        _id: 'q2',
        questionNumber: 2,
        subject: 'Physics',
        type: 'single',
        question: 'An electron enters a uniform magnetic field $B$ perpendicular to its velocity. The radius of curvature of the path is:',
        options: [
          'Proportional to its energy',
          'Proportional to its momentum',
          'Inversely proportional to its momentum',
          'Independent of its velocity'
        ],
        correctAnswer: [1], // Code index 1 (Option B)
        solution: 'The centripetal force is supplied by the magnetic force: $\\frac{mv^2}{R} = qvB \\implies R = \\frac{mv}{qB} = \\frac{p}{qB}$. Thus, the radius of curvature is directly proportional to its momentum.'
      }
    ],
    responses: {
      'q1': { selectedAnswers: [1], status: 'answered', isCorrect: true, timeSpent: 42 },
      'q2': { selectedAnswers: [0], status: 'answered', isCorrect: false, timeSpent: 75 }
    }
  };

  const activeResult = data || fallbackResult;
  const { score, maxMarks, accuracy, attempted, unattempted, correct, wrong, subjectAnalysis, difficultyAnalysis, questions, responses: userAnswers } = activeResult;

  const reviewQuestion = questions[activeQuestionReviewIndex];

  // Request AI Solution via Gemini API
  const handleRequestAiSolution = async (questionId) => {
    setLoadingAi(true);
    setAiExplanation('');
    try {
      const res = await explainQuestionSolution(questionId);
      setAiExplanation(res.explanation);
    } catch (err) {
      console.error(err);
      setAiExplanation('Oops! An error occurred while retrieving AI explanations. Please confirm your Gemini API Key in the server properties.');
    } finally {
      setLoadingAi(false);
    }
  };

  const pieData = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Wrong', value: wrong, color: '#ef4444' },
    { name: 'Unattempted', value: unattempted, color: '#64748b' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back to dashboard */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Performance Scorecard</h1>
          <p className="text-slate-400 text-sm mt-0.5">{activeResult?.examId?.title || 'Extracted Assessment Result'}</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Score obtained */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score Obtained</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-3xl font-extrabold text-white">{score}</strong>
              <span className="text-xs text-slate-400">/ {maxMarks}</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attempt Accuracy</span>
            <h3 className="text-3xl font-extrabold mt-1 text-white">{accuracy}%</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
        </div>

        {/* Correct Answers */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Correct Answers</span>
            <h3 className="text-3xl font-extrabold mt-1 text-emerald-400">{correct} <span className="text-xs text-slate-500 font-semibold">Questions</span></h3>
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Wrong Answers */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Wrong Answers</span>
            <h3 className="text-3xl font-extrabold mt-1 text-red-400">{wrong} <span className="text-xs text-slate-500 font-semibold">Questions</span></h3>
          </div>
          <div className="h-12 w-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center justify-center">
            <XCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics chart and analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie breakdowns */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex flex-col justify-between items-center">
          <div className="w-full text-left self-start">
            <h3 className="text-base font-bold text-white">Item Analysis</h3>
            <p className="text-slate-500 text-xs mt-0.5">Summary of question attempt decisions</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs font-semibold select-none">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-400">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty breakdowns */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex flex-col justify-between lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Difficulty Breakdown</h3>
            <p className="text-slate-500 text-xs mt-0.5">Attempt correctness segregated by question grading</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyAnalysis} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="correct" name="Correct" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="wrong" name="Wrong" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Question review details */}
      {questions.length > 0 && reviewQuestion && (
        <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden shadow-premium">
          <div className="p-5 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Question Review Section</h3>
              <p className="text-slate-500 text-xs mt-0.5">Verify paper solutions and analysis</p>
            </div>
            
            {/* Direct selector tabs */}
            <div className="flex gap-2">
              {questions.map((q, idx) => {
                const answer = userAnswers[q._id];
                const isCorrect = answer?.isCorrect;
                const isUnattempted = !answer || answer.selectedAnswers.length === 0;

                return (
                  <button
                    key={q._id}
                    onClick={() => {
                      setActiveQuestionReviewIndex(idx);
                      setAiExplanation('');
                    }}
                    className={`h-7 w-7 rounded font-bold text-xs transition-all active:scale-[0.98] ${
                      idx === activeQuestionReviewIndex
                        ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-slate-950'
                        : ''
                    } ${
                      isUnattempted
                        ? 'bg-slate-800 text-slate-300'
                        : isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Question detail */}
            <div className="space-y-4">
              <span className="text-xs uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">
                Subject: {reviewQuestion.subject} | Question {reviewQuestion.questionNumber}
              </span>
              <p className="text-slate-200 text-base leading-relaxed select-text font-medium">
                {reviewQuestion.question}
              </p>
            </div>

            {/* Options display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewQuestion.options && reviewQuestion.options.map((opt, idx) => {
                const isCorrectOption = reviewQuestion.correctAnswer.includes(idx);
                const answer = userAnswers[reviewQuestion._id];
                const isSelectedByCandidate = answer?.selectedAnswers.includes(idx);

                let optStyle = 'border-slate-850 hover:bg-slate-900/10 text-slate-350';
                if (isCorrectOption) {
                  optStyle = 'border-emerald-500/80 bg-emerald-500/5 text-emerald-300 font-semibold';
                } else if (isSelectedByCandidate) {
                  optStyle = 'border-red-500/80 bg-red-500/5 text-red-300';
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 border rounded-lg flex items-start gap-3 select-text leading-normal ${optStyle}`}
                  >
                    <span className={`w-5.5 h-5.5 rounded-full border text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                      isCorrectOption
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isSelectedByCandidate
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="text-sm">{opt}</div>
                  </div>
                );
              })}
            </div>

            {/* Candidate decision info */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold bg-slate-900/30 p-3.5 border border-slate-900 rounded-lg select-none">
              <div className="text-slate-400">
                Candidate Selected: {' '}
                <strong className={userAnswers[reviewQuestion._id]?.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                  {userAnswers[reviewQuestion._id]?.selectedAnswers.length > 0 
                    ? userAnswers[reviewQuestion._id].selectedAnswers.map(a => String.fromCharCode(65 + Number(a))).join(', ')
                    : 'Unattempted'}
                </strong>
              </div>
              <div className="text-slate-400">
                Correct Key:{' '}
                <strong className="text-emerald-400">
                  {reviewQuestion.correctAnswer.map(c => String.fromCharCode(65 + Number(c))).join(', ')}
                </strong>
              </div>
              <div className="text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Time Spent: <strong className="text-white">{userAnswers[reviewQuestion._id]?.timeSpent || 0} seconds</strong>
              </div>
            </div>

            {/* Textbook Solution explanation */}
            {reviewQuestion.solution && (
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg">
                <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Textbook Explanation:</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{reviewQuestion.solution}</p>
              </div>
            )}

            {/* AI step-by-step assistant */}
            <div className="pt-4 border-t border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-primary-400" />
                    Gemini AI Solution Explainer
                  </h4>
                  <p className="text-slate-500 text-xs">Request detailed step-by-step chemical or physical annotations</p>
                </div>
                <button
                  disabled={loadingAi}
                  onClick={() => handleRequestAiSolution(reviewQuestion._id)}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1 active:scale-[0.98]"
                >
                  {loadingAi ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Consulting Gemini...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4" />
                      Explain Formula Steps
                    </>
                  )}
                </button>
              </div>

              {aiExplanation && (
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-lg text-slate-350 text-sm leading-relaxed select-text space-y-2 animate-in fade-in duration-200">
                  <h5 className="font-bold text-slate-300 text-xs uppercase">Detailed Step Breakdown:</h5>
                  <p className="whitespace-pre-line">{aiExplanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
