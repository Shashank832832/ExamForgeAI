import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 180,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 300,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 75,
    },
    description: {
      type: String,
      default: '',
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    instructions: {
      type: [String],
      default: [],
    },
    markingScheme: {
      correct: {
        type: Number,
        default: 4,
      },
      incorrect: {
        type: Number,
        default: -1,
      },
      numericalCorrect: {
        type: Number,
        default: 4,
      },
      numericalIncorrect: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
