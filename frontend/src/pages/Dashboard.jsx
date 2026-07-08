import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/examService';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  BrainCircuit, 
  BookOpenText, 
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  // Use React Query to load user statistics
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  // Gorgeous fallback metadata if database is newly provisioned
  const fallbackData = {
    stats: {
      recentTestsAttempted: 4,
      avgAccuracy: 78,
      avgScore: 168,
      weakSubject: 'Chemistry (Organic)'
    },
    performanceHistory: [
      { name: 'Mock 1', score: 140, avgScore: 120 },
      { name: 'Mock 2', score: 155, avgScore: 135 },
      { name: 'Mock 3', score: 180, avgScore: 145 },
      { name: 'Mock 4', score: 168, avgScore: 148 }
    ],
    subjectAccuracy: [
      { subject: 'Physics', accuracy: 85, fullMark: 100 },
      { subject: 'Chemistry', accuracy: 62, fullMark: 100 },
      { subject: 'Mathematics', accuracy: 88, fullMark: 100 }
    ],
    recentAttempts: [
      { _id: '1', examId: { title: 'JEE Main Full Physics Test' }, score: 85, maxMarks: 100, accuracy: 85, date: '2026-07-06T12:00:00Z' },
      { _id: '2', examId: { title: 'IIT JEE Advanced Quiz 1' }, score: 120, maxMarks: 180, accuracy: 72, date: '2026-07-03T15:30:00Z' }
    ],
    upcomingExams: [
      { _id: 'e1', title: 'JEE Main CBT - Full Mock 5', duration: 180, subject: 'JEE Syllabus', date: 'Live Now' },
      { _id: 'e2', title: 'NEET Practice PDF Mock 1', duration: 200, subject: 'Biology + PC', date: 'Available' }
    ]
  };

  const activeData = data || fallbackData;
  const { stats, performanceHistory, subjectAccuracy, recentAttempts, upcomingExams } = activeData;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800 rounded-xl md:col-span-2"></div>
          <div className="h-80 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header greetings */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Candidate Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review your recent analytics and mock test metrics</p>
        </div>
        <Link
          to="/exams"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all text-sm"
        >
          <BookOpenText className="h-4.5 w-4.5" />
          Attempt Mock Exams
        </Link>
      </div>

      {/* stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl shadow-premium flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tests Attempted</span>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.recentTestsAttempted}</h3>
          </div>
          <div className="h-12 w-12 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl shadow-premium flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Score</span>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.avgScore}</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl shadow-premium flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Accuracy</span>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.avgAccuracy}%</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl shadow-premium flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Weak Areas</span>
            <h3 className="text-sm font-bold mt-2 text-amber-400 truncate max-w-[160px]">{stats.weakSubject}</h3>
          </div>
          <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
            <BrainCircuit className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Over Time */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
            <p className="text-slate-500 text-xs mt-0.5">Mock scores compared against cohort averages</p>
          </div>
          <div className="h-72 w-full text-slate-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="score" name="Your Marks" stroke="#38b0fa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="avgScore" name="Mock Avg" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-Wise Strengths */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Subject Breakdown</h3>
            <p className="text-slate-500 text-xs mt-0.5">Average accuracy percentage per subject stream</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={subjectAccuracy}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" style={{ fontSize: 10 }} />
                <Radar name="Accuracy %" dataKey="accuracy" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attempts lists & upcoming tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts list */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Recent Test Attempts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3">CBT Examination</th>
                  <th scope="col" className="px-4 py-3 text-center">Score</th>
                  <th scope="col" className="px-4 py-3 text-center">Accuracy</th>
                  <th scope="col" className="px-4 py-3 text-center">Date</th>
                  <th scope="col" className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt) => (
                    <tr key={attempt._id} className="border-b border-slate-850 hover:bg-slate-900/50">
                      <td className="px-4 py-3.5 font-semibold text-slate-200">{attempt.examId?.title || 'Unknown Exam'}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-primary-400">{attempt.score} / {attempt.maxMarks || 100}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          attempt.accuracy >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {attempt.accuracy}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-slate-500">
                        {new Date(attempt.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link 
                          to={`/result/${attempt._id}`}
                          className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center justify-end gap-1.5"
                        >
                          Show Report
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-500">No recent submissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Mock Tests */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Recommended Exams</h3>
          <div className="space-y-4">
            {upcomingExams.map((exam) => (
              <div key={exam._id} className="p-4 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-lg flex items-center justify-between transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold bg-primary-500/10 text-primary-400 px-1.5 py-0.5 rounded">
                      {exam.subject}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      {exam.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 mt-1 max-w-[180px] truncate">{exam.title}</h4>
                  <p className="text-xs text-slate-505 text-slate-500 mt-0.5">Duration: {exam.duration} mins</p>
                </div>
                <Link
                  to={`/exams`}
                  className="p-2 bg-slate-800 hover:bg-primary-500 text-slate-300 hover:text-white rounded-lg transition-all active:scale-95"
                >
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
