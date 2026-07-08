import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
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
    responses: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedAnswers: {
          type: [mongoose.Schema.Types.Mixed],
          default: [],
        },
        status: {
          type: String,
          enum: ['visited', 'answered', 'review', 'answered_review', 'not_visited', 'not_answered'],
          default: 'not_visited',
        },
        timeSpent: {
          type: Number, // in seconds
          default: 0,
        },
      },
    ],
    timeLeft: {
      type: Number, // seconds left
      required: true,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
