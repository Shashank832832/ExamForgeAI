import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementWarning, submitExamState } from '../store/examSlice';
import { useFullscreen } from '../hooks/useFullscreen';
import { useTabFocus } from '../hooks/useTabFocus';
import { AlertOctagon, ShieldAlert, Minimize } from 'lucide-react';

export default function ExamLayout({ children }) {
  const dispatch = useDispatch();
  const { isExamStarted, warningCount, activeExam, responses, timeLeft, currentQuestionIndex } = useSelector((state) => state.exam);
  const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Set up local storage backup
  useEffect(() => {
    if (isExamStarted && activeExam) {
      const backup = {
        responses,
        timeLeft,
        currentQuestionIndex,
        warningCount,
        activeExam,
        backupTime: Date.now()
      };
      localStorage.setItem(`exam_backup_${activeExam._id}`, JSON.stringify(backup));
    }
  }, [responses, timeLeft, currentQuestionIndex, warningCount, isExamStarted, activeExam]);

  // Lock scroll
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // Trap window close / reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isExamStarted) {
        const msg = 'Are you sure you want to exit the exam? Your active progress will be cached, but the timer keeps running.';
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isExamStarted]);

  // Tab switching warning callback
  const handleTabChange = () => {
    if (isExamStarted) {
      dispatch(incrementWarning());
      setModalMessage('Tab switching detected! Continuing to switch tabs will lead to automatic submission of your exam.');
      setShowWarningModal(true);
    }
  };

  // Bind tab focus hook
  useTabFocus(handleTabChange);

  // Monitor auto-fullscreen request
  useEffect(() => {
    if (isExamStarted && !isFullscreen) {
      // Prompt user to go full screen
      setModalMessage('This examination must be attempted in Fullscreen mode. Please enter fullscreen to continue.');
      setShowWarningModal(true);
    }
  }, [isExamStarted, isFullscreen]);

  // Automatic submission when warning count matches threshold
  useEffect(() => {
    if (warningCount >= 5) {
      alert('Maximum tab switches exceeded. Submitting exam automatically.');
      dispatch(submitExamState());
      setShowWarningModal(false);
    }
  }, [warningCount, dispatch]);

  const handleResolveModal = () => {
    setShowWarningModal(false);
    if (!isFullscreen && isExamStarted) {
      requestFullscreen();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 select-none overflow-hidden pb-safe">
      {/* Content wrapper */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {children}
      </div>

      {/* Security warning overlay modals */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-red-200 max-w-md w-full p-6 text-center leading-normal animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2">Security Warning</h3>
            <p className="text-sm text-slate-600 mb-6">{modalMessage}</p>

            <div className="flex flex-col gap-2.5">
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={handleResolveModal}
                  className="w-full bg-jee-accent border-jee-accent text-white font-semibold py-2.5 rounded hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5"
                >
                  <Minimize className="h-4 w-4 rotate-45" />
                  Enter Fullscreen Mode
                </button>
              )}
              
              {isFullscreen && (
                <button
                  type="button"
                  onClick={handleResolveModal}
                  className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded hover:bg-slate-800 transition-colors"
                >
                  I Understand & Resume Exam
                </button>
              )}
              
              <div className="text-xs text-red-500 font-semibold mt-2">
                Warnings logged: {warningCount} of 5.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
