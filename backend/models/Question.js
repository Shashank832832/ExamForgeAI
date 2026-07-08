import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['single', 'multiple', 'numerical', 'integer', 'subjective'],
      default: 'single',
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: [mongoose.Schema.Types.Mixed], // array containing indices [0] or [1,3], or text values for numerical inputs e.g. ["15"]
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    solution: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    chapter: {
      type: String,
      default: '',
    },
    topic: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
