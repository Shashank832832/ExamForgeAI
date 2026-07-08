import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If already logged in, skip the auth pages and go straight to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Visual Brand Panel - Left Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-primary-950 via-slate-900 to-indigo-950 border-r border-slate-800">
        {/* Abstract animated backgrounds */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo */}
        <div className="flex items-center gap-2 text-white relative z-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-primary-200 bg-clip-text text-transparent">ExamForge</span>
            <span className="text-primary-400 font-bold ml-1">AI</span>
          </div>
        </div>

        {/* Hero message & Value points */}
        <div className="my-auto py-12 relative z-10 max-w-md">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
            Convert any Exam PDF into a Real Computer-Based Test
          </h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Our AI-powered OCR technology extracts questions, tables, complex math equations, and diagrams. Simulates realistic JEE, NEET, and GATE test experiences down to the pixel.
          </p>

          {/* Features check list */}
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary-400 shrink-0" />
              <span>Pixel-perfect replica of JEE Main CBT</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary-400 shrink-0" />
              <span>AI LaTeX math equation rendering</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary-400 shrink-0" />
              <span>Comprehensive performance analytics</span>
            </li>
          </ul>
        </div>

        {/* Info footer */}
        <div className="text-slate-500 text-sm relative z-10">
          © {new Date().getFullYear()} ExamForge AI. All rights reserved. Registered candidates CBT interface.
        </div>
      </div>

      {/* Forms Segment - Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
