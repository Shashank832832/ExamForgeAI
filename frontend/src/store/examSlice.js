import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeExam: null,
  questions: [],
  sections: {}, // { 'Physics': [0, 1, 2], 'Chemistry': [3, 4] }
  currentQuestionIndex: 0,
  responses: {}, // { questionId: { selectedAnswers: [], status: 'visited'/'answered'/'review'/'answered_review'/'not_visited'/'not_answered', timeSpent: 0 } }
  timeLeft: 0, // In seconds
  totalTime: 0,
  warningCount: 0,
  isExamStarted: false,
  isExamSubmitted: false,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    startExam: (state, action) => {
      const { exam, questions } = action.payload;
      state.activeExam = exam;
      state.questions = questions;
      state.currentQuestionIndex = 0;
      state.isExamStarted = true;
      state.isExamSubmitted = false;
      state.warningCount = 0;
      state.timeLeft = exam.duration * 60; // duration in minutes
      state.totalTime = exam.duration * 60;
      
      // Categorize into sections
      const sections = {};
      questions.forEach((q, idx) => {
        const sec = q.subject || 'General';
        if (!sections[sec]) {
          sections[sec] = [];
        }
        sections[sec].push(idx);
      });
      state.sections = sections;

      // Initialize responses
      const responses = {};
      questions.forEach((q) => {
        responses[q._id] = {
          selectedAnswers: [],
          status: 'not_visited',
          timeSpent: 0,
        };
      });
      state.responses = responses;
      
      // Mark first question as not answered (visited)
      if (questions.length > 0) {
        responses[questions[0]._id].status = 'not_answered';
      }
    },
    
    selectQuestion: (state, action) => {
      const nextIdx = action.payload;
      const prevQ = state.questions[state.currentQuestionIndex];
      
      // Update previous question state if it was "not_visited"
      if (prevQ && state.responses[prevQ._id]) {
        if (state.responses[prevQ._id].status === 'not_visited') {
          state.responses[prevQ._id].status = 'not_answered';
        }
      }

      state.currentQuestionIndex = nextIdx;
      const newQ = state.questions[nextIdx];
      
      // Update new question state to not_answered if it was not_visited
      if (newQ && state.responses[newQ._id]) {
        if (state.responses[newQ._id].status === 'not_visited') {
          state.responses[newQ._id].status = 'not_answered';
        }
      }
    },
    
    saveAnswer: (state, action) => {
      const { questionId, selectedAnswers } = action.payload;
      if (state.responses[questionId]) {
        state.responses[questionId].selectedAnswers = selectedAnswers;
        state.responses[questionId].status = 'answered';
      }
    },
    
    markForReview: (state, action) => {
      const { questionId, selectedAnswers } = action.payload;
      if (state.responses[questionId]) {
        state.responses[questionId].selectedAnswers = selectedAnswers;
        state.responses[questionId].status = selectedAnswers.length > 0 ? 'answered_review' : 'review';
      }
    },
    
    clearResponse: (state, action) => {
      const { questionId } = action.payload;
      if (state.responses[questionId]) {
        state.responses[questionId].selectedAnswers = [];
        state.responses[questionId].status = 'not_answered';
      }
    },
    
    tickTimer: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
        
        // Track time spent for current question
        const currentQ = state.questions[state.currentQuestionIndex];
        if (currentQ && state.responses[currentQ._id]) {
          state.responses[currentQ._id].timeSpent += 1;
        }
      }
    },
    
    incrementWarning: (state) => {
      state.warningCount += 1;
    },
    
    submitExamState: (state) => {
      state.isExamStarted = false;
      state.isExamSubmitted = true;
    },
    
    restoreExamState: (state, action) => {
      const { responses, timeLeft, currentQuestionIndex, warningCount, activeExam, questions, sections } = action.payload;
      state.responses = responses;
      state.timeLeft = timeLeft;
      state.currentQuestionIndex = currentQuestionIndex;
      state.warningCount = warningCount;
      state.activeExam = activeExam;
      state.questions = questions;
      state.sections = sections;
      state.isExamStarted = true;
      state.isExamSubmitted = false;
    },
    
    resetExam: (state) => {
      return initialState;
    }
  },
});

export const {
  startExam,
  selectQuestion,
  saveAnswer,
  markForReview,
  clearResponse,
  tickTimer,
  incrementWarning,
  submitExamState,
  restoreExamState,
  resetExam,
} = examSlice.actions;

export default examSlice.reducer;
