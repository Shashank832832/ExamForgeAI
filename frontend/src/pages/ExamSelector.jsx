import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getExamsList } from '../services/examService';
import { BookOpen, Timer, Tag, AlertTriangle, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ExamSelector() {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['examsList'],
    queryFn: getExamsList,
  });

  // Gorgeous fallback metadata for mock exams inside sandbox
  const defaultExams = [
    {
      _id: 'sample-jee-1',
      title: 'JEE Main Mock Test - Physics & Mathematics Chapter-wise',
      duration: 180, // minutes
      totalMarks: 300,
      totalQuestions: 75,
      subject: 'PCM Stream',
      description: 'Full syllabus covering electrostatics, modern physics, calculus, algebra, stoichiometry, kinetics.',
      questionsCount: 75,
      instructions: [
        'The test contains 75 questions divided into Physics, Chemistry, and Mathematics.',
        'Each subject contains 25 questions divided into single correct and numerical response types.',
        'Single Correct: +4 marks for correct, -1 for wrong.',
        'Numerical Answer: +4 marks for correct, 0 for wrong (no negative marking).',
        'Attempting the test in fullscreen is mandatory. Tab changes will lock warnings.',
      ]
    },
    {
      _id: 'sample-neet-1',
      title: 'NEET 2026 Biology Simulation Quiz',
      duration: 90,
      totalMarks: 360,
      totalQuestions: 90,
      subject: 'Biology Stream',
      description: 'Focuses entirely on Plant Physiology, Human Anatomy, Cell Biology, and Genetics.',
      questionsCount: 90,
      instructions: [
        'The test contains 90 questions from Biological science.',
        'Single Correct type only: +4 for correct, -1 for negative marking.',
        'Once started, exam cannot be paused. Keep eye on the countdown clock.',
      ]
    }
  ];

  const activeExams = exams || defaultExams;

  const handleStartExamRequest = (exam) => {
    setSelectedExam(exam);
    setShowInstructions(true);
  };

  const launchExamSession = () => {
    if (selectedExam) {
      setShowInstructions(false);
      navigate(`/exam/${selectedExam._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">CBT Test Center</h1>
        <p className="text-slate-400 text-sm mt-1">Select an extracted examination paper to start the CBT simulation</p>
      </div>

      {activeExams.length === 0 ? (
        <div className="bg-slate-950 border border-slate-850 p-12 text-center rounded-xl">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No exams uploaded yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Log in as an Administrator, navigate to the Admin Console, and extract a PDF question paper to create a Mock Test.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-slate-950 border border-slate-850 hover:border-slate-750 p-6 rounded-xl flex flex-col justify-between shadow-premium transition-all hover:-translate-y-0.5 duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-extrabold bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded">
                    {exam.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {exam.totalQuestions || exam.questionsCount || 0} Questions
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 hover:text-primary-400 transition-colors line-clamp-1">
                  {exam.title}
                </h3>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {exam.description || 'Simulate computer-based examinations with this AI generated structured mock test paper.'}
                </p>

                <div className="grid grid-cols-2 gap-4 my-5 bg-slate-900/30 p-3 rounded-lg border border-slate-900 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Timer className="h-4 w-4 text-primary-400" />
                    <span>Duration: <strong className="text-white">{exam.duration} Min</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Tag className="h-4 w-4 text-primary-400" />
                    <span>Max Marks: <strong className="text-white">{exam.totalMarks || 300}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartExamRequest(exam)}
                className="w-full bg-slate-900 border border-slate-800 hover:bg-primary-500 hover:border-primary-500 text-slate-200 hover:text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
              >
                Assemble CBT Portal
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Instructions Model / Drawers */}
      {showInstructions && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Standard Examination Instructions</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedExam.title}</p>
              </div>
              <span className="bg-jee-header text-white font-bold text-xs px-2.5 py-1 rounded">
                CBT Portal
              </span>
            </div>

            {/* Content list */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-700">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-xs text-amber-800 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="font-bold">Strict Exam Environment Enabled:</strong> Tab switching, page refreshing, minimizing, or exiting the fullscreen simulator mode will fire security warning logs. Excelling 5 warning triggers leads to automated exam termination.
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">General Guidelines:</h4>
                <ul className="list-decimal pl-5 space-y-2 text-xs">
                  {selectedExam.instructions ? (
                    selectedExam.instructions.map((inst, index) => (
                      <li key={index}>{inst}</li>
                    ))
                  ) : (
                    <>
                      <li>The countdown clock on upper header panel shows time remaining.</li>
                      <li>Clicking "Save & Next" saves options and loads next query.</li>
                      <li>Use "Clear Response" to drop option selection.</li>
                      <li>Numerical entries must contain typed integers or decimals.</li>
                    </>
                  )}
                  <li>Ensure stable internet or allow sandbox offline storage backup recovery.</li>
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-900 mb-2.5">CBT Palette Color Scheme Guide:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#E8ECF1] border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">1</span>
                    <span>Not Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-t bg-jee-notAnswered border border-jee-notAnswered flex items-center justify-center font-bold text-xs text-white">2</span>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-b bg-jee-answered border border-jee-answered flex items-center justify-center font-bold text-xs text-white">3</span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-jee-markedReview border border-jee-markedReview flex items-center justify-center font-bold text-xs text-white">4</span>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="w-6 h-6 rounded-full bg-jee-markedAnsweredReview border border-jee-markedAnsweredReview flex items-center justify-center font-bold text-xs text-white">5</span>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white">✓</span>
                    </div>
                    <span>Answered + Review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-lg">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={launchExamSession}
                className="px-5 py-2 bg-jee-header hover:bg-slate-800 text-white font-bold rounded text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                I Am Ready To Begin
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
