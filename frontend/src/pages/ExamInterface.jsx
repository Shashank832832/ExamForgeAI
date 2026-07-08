import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getExamById, submitExamDetails } from '../services/examService';
import { 
  startExam, 
  selectQuestion, 
  saveAnswer, 
  markForReview, 
  clearResponse, 
  tickTimer,
  submitExamState,
  restoreExamState,
  resetExam
} from '../store/examSlice';
import { formatTime } from '../utils/timeFormatter';
import { 
  Calculator, 
  FileEdit, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  AlertTriangle, 
  Loader2, 
  Eraser, 
  ChevronLeft, 
  ChevronRight,
  Info 
} from 'lucide-react';

export default function ExamInterface() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    activeExam,
    questions,
    sections,
    currentQuestionIndex,
    responses,
    timeLeft,
    warningCount,
    isExamSubmitted,
  } = useSelector((state) => state.exam);

  // Local state for candidate features
  const [showCalculator, setShowCalculator] = useState(false);
  const [showRoughSheet, setShowRoughSheet] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');
  const [tempAnswers, setTempAnswers] = useState([]);
  const [tempNumericalValue, setTempNumericalValue] = useState('');

  // Floating rough sheet canvas references
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load Exam and questions from API
  const { data: remoteData, isLoading, error } = useQuery({
    queryKey: ['activeExamSetup', examId],
    queryFn: () => getExamById(examId),
    enabled: !activeExam, // only query if redux is not already populated
  });

  // API Submit attempt Mutation
  const mutation = useMutation({
    mutationFn: (payload) => submitExamDetails(examId, payload),
    onSuccess: (data) => {
      dispatch(resetExam());
      // Delete backup cache
      localStorage.removeItem(`exam_backup_${examId}`);
      navigate(`/result/${data.attempt._id || data.attemptId || data._id}`);
    },
    onError: (err) => {
      console.error(err);
      alert('Submissions failed. Storing logs locally. Redirecting to dashboard.');
      navigate('/');
    }
  });

  const activeQuestion = questions[currentQuestionIndex];

  // Fetch or Restore from LocalStorage Backup
  useEffect(() => {
    if (!activeExam && remoteData) {
      // Check if backup exists
      const savedBackup = localStorage.getItem(`exam_backup_${examId}`);
      if (savedBackup) {
        const parsed = JSON.parse(savedBackup);
        // If backup is fresh (within duration)
        if (Date.now() - parsed.backupTime < parsed.timeLeft * 1000 + 3600000) {
          if (window.confirm('A saved session was found for this exam. Would you like to restore your progress?')) {
            dispatch(restoreExamState(parsed));
            return;
          }
        }
      }
      dispatch(startExam({ exam: remoteData.exam, questions: remoteData.questions }));
    }
  }, [remoteData, activeExam, examId, dispatch]);

  // Timer Tick Interval
  useEffect(() => {
    let timer;
    if (activeExam && !isExamSubmitted) {
      timer = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeExam, isExamSubmitted, dispatch]);

  // Trigger MathJax equation rendering upon question switch
  useEffect(() => {
    if (activeQuestion && window.MathJax) {
      try {
        window.MathJax.typesetPromise();
      } catch (err) {
        console.warn('MathJax processing exception: ', err);
      }
    }
    
    // Sync temporary selected option states when active question changes
    if (activeQuestion && responses[activeQuestion._id]) {
      setTempAnswers(responses[activeQuestion._id].selectedAnswers || []);
      setTempNumericalValue(responses[activeQuestion._id].selectedAnswers[0] || '');
    }
  }, [currentQuestionIndex, activeQuestion, responses]);

  // Auto-submit when time completes
  useEffect(() => {
    if (timeLeft <= 0 && activeExam && !isExamSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, activeExam, isExamSubmitted]);

  // If exam gets submitted (from hook warnings or timeout), fire API submit mutation
  useEffect(() => {
    if (isExamSubmitted && activeExam) {
      submitCandidatePayload();
    }
  }, [isExamSubmitted, activeExam]);

  const submitCandidatePayload = () => {
    const formattedResponses = Object.keys(responses).map((qId) => ({
      questionId: qId,
      selectedAnswers: responses[qId].selectedAnswers,
      status: responses[qId].status,
      timeSpent: responses[qId].timeSpent,
    }));
    
    const payload = {
      responses: formattedResponses,
      timeLeft,
      warningCount,
    };
    mutation.mutate(payload);
  };

  const handleSubmitExam = () => {
    if (window.confirm('Are you sure you want to submit your examination? Once submitted, answers cannot be edited.')) {
      dispatch(submitExamState());
    }
  };

  const handleSelectOption = (optIndex) => {
    if (activeQuestion.type === 'multiple') {
      if (tempAnswers.includes(optIndex)) {
        setTempAnswers(tempAnswers.filter((i) => i !== optIndex));
      } else {
        setTempAnswers([...tempAnswers, optIndex]);
      }
    } else {
      setTempAnswers([optIndex]);
    }
  };

  // Numerical response entries handler
  const handleNumericalChange = (e) => {
    const val = e.target.value;
    setTempNumericalValue(val);
    setTempAnswers([val]);
  };

  const handleSaveAndNext = () => {
    if (activeQuestion) {
      if (tempAnswers.length > 0) {
        dispatch(saveAnswer({ questionId: activeQuestion._id, selectedAnswers: tempAnswers }));
      }
      
      // Auto move next
      if (currentQuestionIndex < questions.length - 1) {
        dispatch(selectQuestion(currentQuestionIndex + 1));
      }
    }
  };

  const handleMarkReview = () => {
    if (activeQuestion) {
      dispatch(markForReview({ questionId: activeQuestion._id, selectedAnswers: tempAnswers }));
      if (currentQuestionIndex < questions.length - 1) {
        dispatch(selectQuestion(currentQuestionIndex + 1));
      }
    }
  };

  const handleClearResponse = () => {
    if (activeQuestion) {
      dispatch(clearResponse({ questionId: activeQuestion._id }));
      setTempAnswers([]);
      setTempNumericalValue('');
    }
  };

  // Calculator logic
  const handleCalcClick = (val) => {
    if (val === '=') {
      try {
        // Safe sanitization evaluation helper
        const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, '');
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcResult(res.toString());
      } catch (err) {
        setCalcResult('Error');
      }
    } else if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else {
      setCalcInput(calcInput + val);
    }
  };

  // Canvas drawing logic for virtual rough sheet
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Fullscreen trigger helpers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`Error opening fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Calculate palette overview statuses
  const getOverviewCounts = () => {
    let answered = 0, notAnswered = 0, markedReview = 0, answeredReview = 0, notVisited = 0;
    Object.values(responses).forEach((res) => {
      if (res.status === 'answered') answered++;
      else if (res.status === 'not_answered') notAnswered++;
      else if (res.status === 'review') markedReview++;
      else if (res.status === 'answered_review') answeredReview++;
      else notVisited++;
    });
    return { answered, notAnswered, markedReview, answeredReview, notVisited };
  };

  const { answered, notAnswered, markedReview, answeredReview, notVisited } = getOverviewCounts();

  // Loading state skeleton
  if (isLoading || mutation.isPending) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="h-10 w-10 text-primary-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">
          {mutation.isPending ? 'Calculating Scoring & Submitting Attempts...' : 'Assembling Sandbox CBT Exam Workspace...'}
        </span>
      </div>
    );
  }

  if (error || !activeExam) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-slate-800 p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Failed to load exam</h2>
        <p className="text-sm text-slate-500 mt-1">Please check your network and authorization credentials.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded">
          Return To Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white select-none">
      {/* 1. Header Area */}
      <header className="bg-jee-header text-white px-4 py-2.5 flex items-center justify-between shadow-md select-none shrink-0">
        <div>
          <span className="font-extrabold text-sm tracking-wide">EXAM FORGE AI</span>
          <span className="text-[10px] bg-jee-accent font-bold px-1.5 py-0.5 rounded ml-2">CBT SYSTEM</span>
        </div>
        <div className="text-center font-bold text-xs truncate max-w-sm">
          {activeExam.title}
        </div>
        <div className="flex items-center gap-4">
          {/* Timer Clock */}
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded px-3 py-1 font-mono text-sm text-white">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Time Left:</span>
            <span className={timeLeft < 300 ? 'text-red-400 animate-pulse font-bold' : ''}>{formatTime(timeLeft)}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 hover:bg-slate-800 rounded transition-colors text-white"
            title="Toggle Fullscreen"
          >
            {document.fullscreenElement ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* Candidate Profile Info & Section Navigation Tabs Subbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between select-none shrink-0">
        {/* Sections Selection Tabs */}
        <div className="flex gap-2">
          {Object.keys(sections).map((secName) => {
            const secQueryIndexes = sections[secName];
            const isSecActive = secQueryIndexes.includes(currentQuestionIndex);
            
            // Clicking a section jumps directly to the first question in that subject section
            return (
              <button
                key={secName}
                onClick={() => dispatch(selectQuestion(secQueryIndexes[0]))}
                className={`px-4 py-1.5 text-xs font-bold border transition-colors rounded-sm uppercase ${
                  isSecActive
                    ? 'bg-jee-header border-jee-header text-white shadow-sm'
                    : 'bg-white border-slate-350 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {secName}
              </button>
            );
          })}
        </div>

        {/* Shortcuts */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded text-slate-700 font-bold transition-all"
          >
            <Calculator className="h-3.5 w-3.5" />
            Calculator
          </button>
          
          <button
            onClick={() => setShowRoughSheet(!showRoughSheet)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded text-slate-700 font-bold transition-all"
          >
            <FileEdit className="h-3.5 w-3.5" />
            Rough Sheet
          </button>
        </div>
      </div>

      {/* 2. Main Question Grid Split Portal */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Side: Question Pane */}
        <div className="flex-grow flex flex-col overflow-y-auto p-6 md:p-8 bg-white max-w-[calc(100%-300px)]">
          {activeQuestion ? (
            <div className="space-y-6">
              {/* Question Header tags */}
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center text-xs text-slate-500 font-semibold select-none">
                <span>Question No. <strong className="text-slate-900 text-sm font-extrabold">{currentQuestionIndex + 1}</strong></span>
                <span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                  {activeQuestion.type === 'single' ? 'Single Choice (+4, -1)' : 
                   activeQuestion.type === 'multiple' ? 'Multiple Choice (+4, -1)' : 
                   'Numerical Fill-In (+4, 0)'}
                </span>
              </div>

              {/* Question content */}
              <div className="space-y-4">
                {/* Mathematical Equation Renderer support */}
                <div className="text-slate-800 text-base leading-relaxed font-medium select-text break-words">
                  {/* Pre-process string to support standard Markdown format with math formulas */}
                  {activeQuestion.question}
                </div>
                
                {/* Images attachment (if exists) */}
                {activeQuestion.imageUrl && (
                  <div className="p-2 border border-slate-200 rounded max-w-md bg-slate-50 mx-auto">
                    <img 
                      src={activeQuestion.imageUrl} 
                      alt={`Question graphic ${activeQuestion.questionNumber}`} 
                      className="max-h-56 mx-auto object-contain" 
                    />
                  </div>
                )}
              </div>

              {/* Options panel */}
              <div className="space-y-3 mt-8">
                {activeQuestion.type === 'numerical' || activeQuestion.type === 'integer' ? (
                  // Numerical response textbox
                  <div className="max-w-xs space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Type numerical response:</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Enter floating value or integer"
                      value={tempNumericalValue}
                      onChange={handleNumericalChange}
                      className="w-full border border-slate-350 rounded px-3 py-2 text-sm focus:outline-none focus:border-jee-header"
                    />
                  </div>
                ) : (
                  // Standard Multiple Choice Radio / Checkbox options
                  activeQuestion.options && activeQuestion.options.map((opt, optIdx) => {
                    const isSelected = tempAnswers.includes(optIdx);
                    
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3.5 border rounded transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-primary-50/50 border-primary-500/50 shadow-inner translate-x-0.5'
                            : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {/* Option label identifier flag (A, B, C, D) */}
                        <span className={`w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-slate-400 text-slate-500 bg-white'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        
                        <div className="text-sm font-medium text-slate-800 leading-normal select-text break-words">
                          {opt}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No questions found in this assessment section.
            </div>
          )}
        </div>

        {/* Right Side: Candidate profile & Palette tracker panel */}
        <aside className="w-[300px] border-l border-slate-200 bg-slate-50 flex flex-col justify-between overflow-y-auto shrink-0 select-none">
          {/* Profile photo block */}
          <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
            <div className="h-14 w-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-bold text-slate-400 capitalize text-xs shadow-inner">
              Photo
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 line-clamp-1">Aryan Sharma</div>
              <div className="text-[10px] text-slate-500 font-medium">Batch: JEE 2026</div>
              <div className="text-[10px] text-red-500 font-semibold mt-1">Warnings Logged: {warningCount}</div>
            </div>
          </div>

          {/* Palette status legends counts */}
          <div className="p-4 grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium border-b border-slate-200 bg-white">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-[#E8ECF1] border border-slate-350 flex items-center justify-center font-bold text-slate-700 rounded-sm">{notVisited}</span>
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-jee-notAnswered border border-jee-notAnswered flex items-center justify-center font-bold text-white rounded-t-sm">{notAnswered}</span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-jee-answered border border-jee-answered flex items-center justify-center font-bold text-white rounded-b-sm">{answered}</span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 bg-jee-markedReview border border-jee-markedReview flex items-center justify-center font-bold text-white rounded-full">{markedReview}</span>
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <div className="relative">
                <span className="w-5 h-5 bg-jee-markedAnsweredReview border border-jee-markedAnsweredReview flex items-center justify-center font-bold text-white rounded-full">{answeredReview}</span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">✓</span>
              </div>
              <span className="ml-1">Answered & Marked for Review</span>
            </div>
          </div>

          {/* Palette questions Grid */}
          <div className="flex-grow p-4 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Question Palette</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const res = responses[q._id];
                const isCurrent = idx === currentQuestionIndex;
                let bgStyle = 'bg-[#E8ECF1] border-slate-350 text-slate-800 hover:bg-slate-200';
                let roundedStyle = 'rounded-sm';
                let hasCheck = false;

                if (res) {
                  if (res.status === 'answered') {
                    bgStyle = 'bg-jee-answered border-jee-answered text-white';
                    roundedStyle = 'rounded-b-md';
                  } else if (res.status === 'not_answered') {
                    bgStyle = 'bg-jee-notAnswered border-jee-notAnswered text-white';
                    roundedStyle = 'rounded-t-md';
                  } else if (res.status === 'review') {
                    bgStyle = 'bg-jee-markedReview border-jee-markedReview text-white';
                    roundedStyle = 'rounded-full';
                  } else if (res.status === 'answered_review') {
                    bgStyle = 'bg-jee-markedAnsweredReview border-jee-markedAnsweredReview text-white';
                    roundedStyle = 'rounded-full';
                    hasCheck = true;
                  }
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => dispatch(selectQuestion(idx))}
                    className={`h-8 border text-xs font-bold flex items-center justify-center relative cursor-pointer active:scale-95 duration-100 ${bgStyle} ${roundedStyle} ${
                      isCurrent ? 'ring-2 ring-primary-500 ring-offset-1 border-primary-500' : ''
                    }`}
                  >
                    {idx + 1}
                    {hasCheck && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* submit button bottom panel */}
          <div className="p-4 border-t border-slate-205 border-slate-200 bg-white select-none">
            <button
              onClick={handleSubmitExam}
              className="w-full bg-jee-answered hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition-colors shadow-md flex items-center justify-center gap-1 active:scale-95"
            >
              Submit Test Paper
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Footer Bar Navigation Controls */}
      <footer className="bg-slate-50 border-t border-slate-250 border-slate-200 p-3 select-none flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleClearResponse}
            className="cbt-btn-secondary"
          >
            Clear Response
          </button>
          <button
            onClick={handleMarkReview}
            className="cbt-btn-purple"
          >
            Mark for Review & Next
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => currentQuestionIndex > 0 && dispatch(selectQuestion(currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="cbt-btn-secondary disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          <button
            onClick={handleSaveAndNext}
            className="cbt-btn-success"
          >
            Save & Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* --- FLOATING CALCULATOR --- */}
      {showCalculator && (
        <div className="fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 border-l border-slate-700 text-white shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-right duration-250 select-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calculator className="h-4.5 w-4.5 text-primary-400" />
              <span className="font-bold text-xs uppercase text-slate-300">Calculator Simulator</span>
            </div>
            <button onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-white text-xs font-semibold">
              [Close]
            </button>
          </div>

          <div className="flex-grow my-4 flex flex-col justify-end">
            <input
              type="text"
              readOnly
              value={calcInput}
              placeholder="0"
              className="bg-slate-950 border border-slate-800 rounded p-3 text-right text-lg font-mono text-white mb-2"
            />
            <div className="text-right text-sm text-primary-400 font-mono pr-2 h-6">{calcResult}</div>
          </div>

          {/* Calculator keyboard buttons */}
          <div className="grid grid-cols-4 gap-2 text-sm font-semibold select-none">
            {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((char) => (
              <button
                key={char}
                onClick={() => handleCalcClick(char)}
                className={`py-2 px-3 rounded text-center transition-colors ${
                  char === '='
                    ? 'col-span-2 bg-jee-accent hover:bg-orange-600 text-white'
                    : char === 'C'
                    ? 'bg-red-500/20 hover:bg-red-650 border border-red-500/40 text-red-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- FLOATING VIRTUAL ROUGH CANVAS --- */}
      {showRoughSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-xl flex flex-col p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <FileEdit className="h-4.5 w-4.5 text-primary-400" />
                Virtual Rough Sketchpad
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearCanvas}
                  className="text-xs text-red-400 hover:underline flex items-center gap-0.5"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Erase Block
                </button>
                <button
                  onClick={() => setShowRoughSheet(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  [Dismiss]
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="bg-slate-950 border border-slate-850 rounded my-4 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={550}
                height={320}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair bg-white w-full"
              />
            </div>
            <p className="text-[10px] text-slate-500 text-center">Use your cursor to write down calculations or diagram sketches.</p>
          </div>
        </div>
      )}
    </div>
  );
}
