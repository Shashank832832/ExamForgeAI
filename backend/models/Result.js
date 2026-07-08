import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number, // percentage
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    attempted: {
      type: Number,
      required: true,
    },
    unattempted: {
      type: Number,
      required: true,
    },
    correct: {
      type: Number,
      required: true,
    },
    wrong: {
      type: Number,
      required: true,
    },
    subjectAnalysis: [
      {
        subject: { type: String, required: true },
        score: { type: Number, required: true },
        maxMarks: { type: Number, required: true },
        accuracy: { type: Number, required: true }, // percentage
      },
    ],
    difficultyAnalysis: [
      {
        name: { type: String, required: true }, // 'Easy', 'Medium', 'Hard'
        correct: { type: Number, required: true },
        wrong: { type: Number, required: true },
      },
    ],
    timeAnalysis: {
      avgTimeCorrect: { type: Number, default: 0 }, // in seconds
      avgTimeWrong: { type: Number, default: 0 }, // in seconds
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);
export default Result;
