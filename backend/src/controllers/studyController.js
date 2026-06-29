const StudyLog = require('../models/StudyLog');
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const DailyScore = require('../models/DailyScore');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateLevel } = require('../utils/xpCalculator');

// @route   POST /api/study/start
const startStudy = async (req, res, next) => {
  try {
    const { subject, type = 'deep_work', location = 'home' } = req.body;
    const date = new Date().toISOString().split('T')[0];

    let log = await StudyLog.findOne({ user: req.user._id, date });

    const session = {
      subject,
      startTime: new Date(),
      type,
    };

    if (log) {
      log.sessions.push(session);
      log.location = location;
      await log.save();
    } else {
      const user = await User.findById(req.user._id);
      log = await StudyLog.create({
        user: req.user._id,
        date,
        sessions: [session],
        goal: user.goals.studyGoal || 120,
        location,
      });
    }

    const currentSession = log.sessions[log.sessions.length - 1];

    return sendSuccess(res, { log, sessionId: currentSession._id }, 'Study session started');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/study/end
const endStudy = async (req, res, next) => {
  try {
    const { sessionId, notes, productivity } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const log = await StudyLog.findOne({ user: req.user._id, date });
    if (!log) return sendError(res, 'No study log for today.', 404);

    const session = log.sessions.id(sessionId);
    if (!session) return sendError(res, 'Session not found.', 404);

    session.endTime = new Date();
    session.duration = Math.round((session.endTime - new Date(session.startTime)) / (1000 * 60));
    if (notes) session.notes = notes;

    log.totalDuration = log.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    log.goalAchieved = log.totalDuration >= log.goal;
    if (productivity) log.productivity = productivity;

    // Calculate XP
    const user = await User.findById(req.user._id);
    let xpEarned = 0;
    const hoursStudied = session.duration / 60;

    if (hoursStudied >= 1) xpEarned += 20;
    if (hoursStudied >= 2) xpEarned += 20;
    if (hoursStudied >= 4) xpEarned += 30;

    if (xpEarned > 0) {
      log.xpEarned = (log.xpEarned || 0) + xpEarned;
      const newXP = user.xp + xpEarned;
      const levelInfo = calculateLevel(newXP);
      await User.findByIdAndUpdate(req.user._id, {
        xp: newXP,
        level: levelInfo.level,
        totalXPEarned: user.totalXPEarned + xpEarned,
      });
      await XPLog.create({
        user: req.user._id,
        date,
        amount: xpEarned,
        source: 'activity',
        sourceName: `Study: ${session.subject || 'Session'}`,
        xpBefore: user.xp,
        xpAfter: newXP,
      });
    }

    await log.save();

    const studyScore = Math.min(Math.round((log.totalDuration / log.goal) * 100), 100);
    await DailyScore.findOneAndUpdate(
      { user: req.user._id, date },
      { studyScore },
      { upsert: true }
    );

    return sendSuccess(res, {
      log,
      session,
      xpEarned,
      totalDuration: log.totalDuration,
      goalAchieved: log.goalAchieved,
    }, 'Study session ended');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/study/library/checkin
const libraryCheckIn = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];

    let log = await StudyLog.findOne({ user: req.user._id, date });
    if (log?.isLibraryCheckedIn) {
      return sendError(res, 'Already checked into library.', 400);
    }

    if (log) {
      log.isLibraryCheckedIn = true;
      log.libraryCheckIn = new Date();
      log.location = 'library';
      await log.save();
    } else {
      const user = await User.findById(req.user._id);
      log = await StudyLog.create({
        user: req.user._id,
        date,
        sessions: [],
        goal: user.goals.studyGoal || 120,
        isLibraryCheckedIn: true,
        libraryCheckIn: new Date(),
        location: 'library',
      });
    }

    return sendSuccess(res, { log, checkInTime: log.libraryCheckIn }, 'Library check-in successful');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/study/library/checkout
const libraryCheckOut = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const log = await StudyLog.findOne({ user: req.user._id, date });

    if (!log || !log.isLibraryCheckedIn) {
      return sendError(res, 'Not checked in to library.', 400);
    }

    log.libraryCheckOut = new Date();
    log.isLibraryCheckedIn = false;

    const libraryDuration = Math.round((log.libraryCheckOut - new Date(log.libraryCheckIn)) / (1000 * 60));

    // Add as a session
    log.sessions.push({
      subject: 'Library Study',
      startTime: log.libraryCheckIn,
      endTime: log.libraryCheckOut,
      duration: libraryDuration,
      type: 'library',
    });

    log.totalDuration = log.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    await log.save();

    return sendSuccess(res, {
      log,
      checkInTime: log.libraryCheckIn,
      checkOutTime: log.libraryCheckOut,
      duration: libraryDuration,
    }, 'Library check-out successful');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/study/today
const getTodayStudy = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const log = await StudyLog.findOne({ user: req.user._id, date });
    return sendSuccess(res, { log });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/study/history
const getStudyHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const logs = await StudyLog.find({
      user: req.user._id,
      date: { $gte: startDate.toISOString().split('T')[0] },
    }).sort({ date: -1 });

    const totalMinutes = logs.reduce((sum, l) => sum + l.totalDuration, 0);
    const goalDays = logs.filter((l) => l.goalAchieved).length;

    return sendSuccess(res, {
      logs,
      stats: {
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60),
        goalAchievedDays: goalDays,
        avgDailyMinutes: Math.round(totalMinutes / (logs.length || 1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { startStudy, endStudy, libraryCheckIn, libraryCheckOut, getTodayStudy, getStudyHistory };
