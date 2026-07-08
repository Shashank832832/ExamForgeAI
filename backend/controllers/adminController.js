import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Attempt from '../models/Attempt.js';
import Result from '../models/Result.js';

// @desc    Get dashboard metrics for candidate profile
// @route   GET /api/dashboard/stats
// @access  Private
export const getCandidateDashboardStats = async (req, res) => {
  const userId = req.user._id;

  try {
    const results = await Result.find({ userId }).populate('examId').sort({ createdAt: 1 });
    
    const totalAttempts = results.length;
    let avgAccuracy = 0;
    let avgScore = 0;
    let totalScore = 0;
    let totalAccuracySum = 0;

    const performanceHistory = results.map((r, index) => {
      totalScore += r.score;
      totalAccuracySum += r.accuracy;
      return {
        name: `Test ${index + 1}`,
        score: r.score,
        avgScore: Math.round(r.maxMarks * 0.5) // mock overall standard avg reference
      };
    });

    if (totalAttempts > 0) {
      avgScore = Math.round(totalScore / totalAttempts);
      avgAccuracy = Math.round(totalAccuracySum / totalAttempts);
    }

    // Determine subject weaknesses
    const subjects = {}; // { 'Physics': { correct: 0, total: 0 } }
    results.forEach((r) => {
      r.subjectAnalysis.forEach((sub) => {
        if (!subjects[sub.subject]) {
          subjects[sub.subject] = { correct: 0, total: 0 };
        }
        // accumulate accuracy ratios
        subjects[sub.subject].correct += sub.score > 0 ? sub.score : 0;
        subjects[sub.subject].total += sub.maxMarks;
      });
    });

    const formattedSubjectAccuracy = Object.keys(subjects).map((key) => ({
      subject: key,
      accuracy: subjects[key].total > 0 ? Math.round((subjects[key].correct * 100) / subjects[key].total) : 0,
      fullMark: 100,
    }));

    // Find weakest subject
    let weakSubject = 'N/A';
    let minAccuracy = 100;
    formattedSubjectAccuracy.forEach((s) => {
      if (s.accuracy < minAccuracy) {
        minAccuracy = s.accuracy;
        weakSubject = `${s.subject} (${s.accuracy}% Accuracy)`;
      }
    });

    const recentAttempts = results.slice(-5).reverse().map((r) => ({
      _id: r.attemptId,
      examId: { title: r.examId?.title || 'Mock Exam' },
      score: r.score,
      maxMarks: r.maxMarks,
      accuracy: r.accuracy,
      date: r.createdAt,
    }));

    const upcomingExams = await Exam.find({}).limit(2).select('title duration subject');

    res.json({
      stats: {
        recentTestsAttempted: totalAttempts,
        avgAccuracy,
        avgScore,
        weakSubject,
      },
      performanceHistory,
      subjectAccuracy: formattedSubjectAccuracy.length > 0 ? formattedSubjectAccuracy : [
        { subject: 'Physics', accuracy: 0, fullMark: 100 },
        { subject: 'Chemistry', accuracy: 0, fullMark: 100 },
        { subject: 'Mathematics', accuracy: 0, fullMark: 100 }
      ],
      recentAttempts,
      upcomingExams: upcomingExams.map((e) => ({
        _id: e._id,
        title: e.title,
        duration: e.duration,
        subject: e.subject,
        date: 'Live Now'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for administrative panel
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsersCount = await User.countDocuments({ role: 'student' });
    const totalExamsUploaded = await Exam.countDocuments({});
    const activeSubmissionsCount = await Attempt.countDocuments({ isSubmitted: true });
    
    // Average accuracy across all results
    const results = await Result.find({});
    let accuracySum = 0;
    results.forEach((r) => {
      accuracySum += r.accuracy;
    });
    const avgAccuracyPercent = results.length > 0 ? Math.round(accuracySum / results.length) : 0;

    res.json({
      totalUsersCount,
      totalExamsUploaded,
      avgAccuracyPercent,
      activeSubmissionsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
