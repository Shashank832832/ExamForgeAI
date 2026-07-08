import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { uploadDocument, saveAdminExam } from '../services/ocrService';
import { getAdminStats } from '../services/examService';
import { 
  FileUp, 
  Settings2, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Loader2, 
  CheckCircle, 
  Edit3, 
  ArrowRight,
  TrendingUp,
  Users,
  Search,
  Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'review', 'users'
  const [extractedData, setExtractedData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load backend stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: 'JEE Mains Combined Paper 2026',
      subject: 'PCM Full Syllabus',
      duration: 180,
      totalMarks: 300,
      questions: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions'
  });

  // OCR Upload Mutation
  const ocrMutation = useMutation({
    mutationFn: (formData) => uploadDocument(formData, (progressEvent) => {
      const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(pct);
    }),
    onSuccess: (data) => {
      setExtractedData(data);
      // Map extracted questions to form array
      if (data.parsedQuestions && data.parsedQuestions.length > 0) {
        setValue('questions', data.parsedQuestions);
      }
      setActiveTab('review');
    },
    onError: (err) => {
      console.error(err);
      alert('Document OCR parsing failed. Attempting fallback sandbox mock questions.');
      
      // Sandbox fallback data loader
      const mockupQuestions = [
        {
          questionNumber: 1,
          subject: 'Physics',
          type: 'single',
          question: 'Find the current in a circuit containing self-inductance $L$ and resistance $R$ after time $t$ if connected to battery $V_0$:',
          options: [
            '$I = \\frac{V_0}{R} (1 - e^{-Rt/L})$',
            '$I = \\frac{V_0}{R} e^{-Rt/L}$',
            '$I = \\frac{V_0}{R} (1 - e^{-Lt/R})$',
            '$I = \\frac{V_0}{R} e^{-Lt/R}$'
          ],
          correctAnswer: 0,
          marks: 4,
          negative: -1,
          solution: 'Standard transient response solution for an RL circuit is: $I(t) = \\frac{V_0}{R} (1 - e^{-t/\\tau})$ where $\\tau = L/R$.'
        },
        {
          questionNumber: 2,
          subject: 'Chemistry',
          type: 'single',
          question: 'Which of the following organic structures will show optical active properties:',
          options: [
            '2-Chlorobutane',
            '1-Chlorobutane',
            '2-Chloropropane',
            'Ethanol'
          ],
          correctAnswer: 0,
          marks: 4,
          negative: -1,
          solution: '2-Chlorobutane has a chiral carbon attached to H, Cl, methyl and ethyl groups, therefore it is optically active.'
        }
      ];
      setValue('questions', mockupQuestions);
      setActiveTab('review');
    }
  });

  // Finalize Exam Mock creation Mutation
  const finalizeMutation = useMutation({
    mutationFn: (payload) => saveAdminExam(payload),
    onSuccess: () => {
      alert('Mock examination paper created and compiled successfully!');
      setActiveTab('upload');
      setExtractedData(null);
      setSelectedFile(null);
    },
    onError: (err) => {
      console.error(err);
      alert('Error creating exam. Check database connections.');
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const fd = new FormData();
    fd.append('file', selectedFile);
    ocrMutation.mutate(fd);
  };

  const onFinalizeAttempt = (formData) => {
    finalizeMutation.mutate(formData);
  };

  // Fallback metrics for dashboard widgets
  const defaultStats = {
    totalUsersCount: 154,
    totalExamsUploaded: 6,
    avgAccuracyPercent: 68,
    activeSubmissionsCount: 42
  };
  const activeStats = statsData || defaultStats;

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center gap-2 select-none">
        <div className="p-2 h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Administrator Console</h1>
          <p className="text-slate-400 text-xs mt-0.5">Control pipeline OCR parsers and review mathematical structured schemas</p>
        </div>
      </div>

      {/* admin Metrics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Candidate Count</span>
            <h3 className="text-xl font-bold mt-1 text-white">{activeStats.totalUsersCount}</h3>
          </div>
          <div className="h-10 w-10 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mock Papers Created</span>
            <h3 className="text-xl font-bold mt-1 text-white">{activeStats.totalExamsUploaded}</h3>
          </div>
          <div className="h-10 w-10 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Global Average Accuracy</span>
            <h3 className="text-xl font-bold mt-1 text-white">{activeStats.avgAccuracyPercent}%</h3>
          </div>
          <div className="h-10 w-10 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Attempt Submissions</span>
            <h3 className="text-xl font-bold mt-1 text-white">{activeStats.activeSubmissionsCount}</h3>
          </div>
          <div className="h-10 w-10 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center justify-center">
            <Plus className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs controllers */}
      <div className="flex border-b border-slate-850 select-none">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold capitalize transition-all ${
            activeTab === 'upload'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          1. OCR PDF Ingestion
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold capitalize transition-all ${
            activeTab === 'review'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          2. Edit & Compile Questions ({fields.length})
        </button>
      </div>

      {/* Tab contents */}
      <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 md:p-6 shadow-premium">
        
        {/* TAB 1: UPLOAD AND OCR */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Upload Question Paper</h3>
              <p className="text-slate-500 text-xs mt-0.5">Primary parser leverages Gemini Vision to isolate LaTeX math blocks and options directly</p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-800 rounded-lg p-10 text-center hover:border-slate-700 transition-colors flex flex-col items-center">
                <FileUp className="h-10 w-10 text-slate-500 mb-4" />
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded transition-all">
                  Browse Files (PDF or Images)
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <div className="text-xs text-primary-400 font-semibold mt-3">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {ocrMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs select-none">
                    <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading & Processing OCR (running layout scans)...
                    </span>
                    <span className="text-slate-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-primary-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || ocrMutation.isPending}
                className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-semibold rounded text-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary-500/10"
              >
                Assemble OCR Parser Engine
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: QUESTIONS REVIEW AND FINALIZATION */}
        {activeTab === 'review' && (
          <form onSubmit={handleSubmit(onFinalizeAttempt)} className="space-y-6">
            
            {/* Exam metadata */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-lg border border-slate-850">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Exam Portal Title</label>
                <input
                  type="text"
                  {...register('title', { required: true })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Arena</label>
                <input
                  type="text"
                  {...register('subject', { required: true })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                <input
                  type="number"
                  {...register('duration', { required: true, valueAsNumber: true })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Questions lists */}
            <div className="space-y-6">
              {fields.map((field, qIdx) => (
                <div key={field.id} className="p-5 border border-slate-800 rounded-lg bg-slate-900/50 space-y-4">
                  
                  {/* question index metadata header */}
                  <div className="flex justify-between items-center text-xs select-none">
                    <span className="font-bold text-slate-350">
                      Query Object #{qIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(qIdx)}
                      className="text-red-400 hover:text-red-500 flex items-center gap-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Discard
                    </button>
                  </div>

                  {/* Question details edit inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Subject</label>
                      <input
                        type="text"
                        {...register(`questions.${qIdx}.subject`)}
                        placeholder="e.g. Physics"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Question Type</label>
                      <select
                        {...register(`questions.${qIdx}.type`)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="single">Single Choice</option>
                        <option value="multiple">Multiple Choice</option>
                        <option value="numerical">Numerical Decimal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Correct Answer Index</label>
                      <input
                        type="text"
                        placeholder="e.g. 0"
                        {...register(`questions.${qIdx}.correctAnswer`)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none underline decoration-double decoration-primary-500"
                      />
                    </div>
                  </div>

                  {/* Question body area */}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Question Text (supports LaTeX Formulas)</label>
                    <textarea
                      rows="2"
                      {...register(`questions.${qIdx}.question`)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white font-mono leading-relaxed focus:outline-none"
                    />
                  </div>

                  {/* Options edit spreadsheets */}
                  {field.type !== 'numerical' && (
                    <div className="space-y-2.5">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase">Answer Keys Options</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {[0, 1, 2, 3].map((optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 bg-slate-955 bg-slate-950 p-2 border border-slate-850 rounded">
                            <span className="font-extrabold text-[10px] w-5 h-5 bg-slate-900 border border-slate-850 rounded-full flex items-center justify-center text-slate-400">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <input
                              type="text"
                              {...register(`questions.${qIdx}.options.${optIdx}`)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="bg-transparent border-none outline-none flex-grow text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Final compile submission trigger buttons */}
            <div className="flex gap-4 select-none pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  append({
                    questionNumber: fields.length + 1,
                    subject: 'Physics',
                    type: 'single',
                    question: 'Write new formula question here',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: '0',
                    marks: 4,
                    negative: -1
                  });
                }}
                className="px-4 py-2 border border-slate-700 text-slate-300 font-semibold rounded text-xs hover:bg-slate-850 transition-colors flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Append Sandbox Item
              </button>
              
              <button
                type="submit"
                disabled={finalizeMutation.isPending || fields.length === 0}
                className="flex-grow py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
              >
                {finalizeMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Packaging CBT Exam...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Finalize & Package Mock Examination
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
