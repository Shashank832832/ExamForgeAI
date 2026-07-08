import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import Result from '../models/Result.js';

// @desc    Retrieve all active exams
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({}).select('-questions');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed exam profile + populated questions
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Mock exam configuration not found' });
    }
    res.json({
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        description: exam.description,
        instructions: exam.instructions,
      },
      questions: exam.questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate and submit candidate exam scorecard
// @route   POST /api/exams/:id/submit
// @access  Private
export const submitExamAttempt = async (req, res) => {
  const { responses, timeLeft, warningCount } = req.body;
  const examId = req.params.id;
  const userId = req.user._id;

  try {
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Exam profile not found' });
    }

    const questions = exam.questions;
    const responseMap = {};
    responses.forEach((resp) => {
      responseMap[resp.questionId] = resp;
    });

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let attempted = 0;
    let unattempted = 0;

    const subjectScores = {}; // { 'Physics': { score: 0, max: 0, correct: 0, total: 0 } }
    const difficultyAnalysis = {
      easy: { name: 'Easy', correct: 0, wrong: 0 },
      medium: { name: 'Medium', correct: 0, wrong: 0 },
      hard: { name: 'Hard', correct: 0, wrong: 0 }
    };

    let totalCorrectTime = 0;
    let totalWrongTime = 0;

    // Evaluate each question
    questions.forEach((q) => {
      const qId = q._id.toString();
      const resp = responseMap[qId];
      const isMultipleChoice = q.type === 'multiple';
      const isNumerical = q.type === 'numerical' || q.type === 'integer';
      
      const sub = q.subject || 'General';
      if (!subjectScores[sub]) {
        subjectScores[sub] = { score: 0, max: 0, correct: 0, total: 0 };
      }
      subjectScores[sub].total += 1;

      // Determine max marks per question type
      const positiveMark = isNumerical ? (exam.markingScheme.numericalCorrect || 4) : (exam.markingScheme.correct || 4);
      const negativeMark = isNumerical ? (exam.markingScheme.numericalIncorrect || 0) : (exam.markingScheme.incorrect || -1);
      
      subjectScores[sub].max += positiveMark;

      // If not answered
      if (!resp || !resp.selectedAnswers || resp.selectedAnswers.length === 0) {
        unattempted += 1;
        // set response flag if missing
        if (resp) {
          resp.isCorrect = false;
        }
        return;
      }

      attempted += 1;
      let isCorrect = false;

      // Perform matching logic
      if (isNumerical) {
        // Compare string/decimal values
        const candidateVal = parseFloat(resp.selectedAnswers[0]);
        const keyVal = parseFloat(q.correctAnswer[0]);
        // margin of error 0.05
        isCorrect = !isNaN(candidateVal) && Math.abs(candidateVal - keyVal) < 0.05;
      } else {
        // Check matching array elements for single / multiple choices
        const candidateAns = resp.selectedAnswers.map(String).sort();
        const keyAns = q.correctAnswer.map(String).sort();
        
        isCorrect = candidateAns.length === keyAns.length && candidateAns.every((val, index) => val === keyAns[index]);
      }

      // Track timings
      const timeSpent = resp.timeSpent || 0;

      if (isCorrect) {
        correct += 1;
        score += positiveMark;
        subjectScores[sub].score += positiveMark;
        subjectScores[sub].correct += 1;
        
        difficultyAnalysis[q.difficulty || 'medium'].correct += 1;
        totalCorrectTime += timeSpent;
        resp.isCorrect = true;
      } else {
        wrong += 1;
        score += negativeMark;
        subjectScores[sub].score += negativeMark;
        
        difficultyAnalysis[q.difficulty || 'medium'].wrong += 1;
        totalWrongTime += timeSpent;
        resp.isCorrect = false;
      }
    });

    const maxMarks = exam.totalMarks || (questions.length * 4);
    const accuracy = attempted > 0 ? Math.round((correct * 100) / attempted) : 0;

    // Subject breakdown formatter
    const formattedSubjectAnalysis = Object.keys(subjectScores).map((subKey) => ({
      subject: subKey,
      score: subjectScores[subKey].score,
      maxMarks: subjectScores[subKey].max,
      accuracy: subjectScores[subKey].total > 0 ? Math.round((subjectScores[subKey].correct * 100) / subjectScores[subKey].total) : 0,
    }));

    // Difficulty breakdown formatter
    const formattedDifficultyAnalysis = Object.values(difficultyAnalysis);

    // Save Attempt object
    const attempt = await Attempt.create({
      userId,
      examId,
      responses,
      timeLeft,
      warningCount,
      isSubmitted: true,
      submittedAt: new Date(),
    });

    // Save Result report
    const result = await Result.create({
      userId,
      examId,
      attemptId: attempt._id,
      score,
      maxMarks,
      accuracy,
      totalQuestions: questions.length,
      attempted,
      unattempted,
      correct,
      wrong,
      subjectAnalysis: formattedSubjectAnalysis,
      difficultyAnalysis: formattedDifficultyAnalysis,
      timeAnalysis: {
        avgTimeCorrect: correct > 0 ? Math.round(totalCorrectTime / correct) : 0,
        avgTimeWrong: wrong > 0 ? Math.round(totalWrongTime / wrong) : 0,
      },
    });

    res.status(201).json({
      attempt,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed result scorecard metrics
// @route   GET /api/results/:attemptId
// @access  Private
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findOne({ attemptId: req.params.attemptId })
      .populate('examId')
      .populate({
        path: 'examId',
        populate: { path: 'questions' }
      });
      
    if (!result) {
      return res.status(404).json({ message: 'Scoring scorecard report not found' });
    }
    
    // Map user answers format
    const attempt = await Attempt.findById(req.params.attemptId);
    const answersMap = {};
    if (attempt) {
      attempt.responses.forEach((resp) => {
        answersMap[resp.questionId.toString()] = {
          selectedAnswers: resp.selectedAnswers,
          status: resp.status,
          timeSpent: resp.timeSpent,
          isCorrect: resp.isCorrect,
        };
      });
    }

    res.json({
      examId: result.examId,
      score: result.score,
      maxMarks: result.maxMarks,
      accuracy: result.accuracy,
      totalQuestions: result.totalQuestions,
      attempted: result.attempted,
      unattempted: result.unattempted,
      correct: result.correct,
      wrong: result.wrong,
      subjectAnalysis: result.subjectAnalysis,
      difficultyAnalysis: result.difficultyAnalysis,
      timeAnalysis: result.timeAnalysis,
      questions: result.examId.questions,
      responses: answersMap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
