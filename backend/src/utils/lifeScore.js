/**
 * Life Score calculation engine
 * Score is 0-100 based on daily activity completion
 */

const SCORE_WEIGHTS = {
  sleep: 20,       // Sleep quality and timing
  exercise: 20,    // Workout completion
  meals: 15,       // Meal completion
  water: 15,       // Water goal
  study: 15,       // Study sessions
  screen_time: 10, // Screen time under goal
  mood: 5,         // Mood log
};

const calculateLifeScore = ({
  sleepScore = 0,
  exerciseScore = 0,
  mealsScore = 0,
  waterScore = 0,
  studyScore = 0,
  screenTimeScore = 0,
  moodScore = 0,
}) => {
  const weighted =
    (sleepScore / 100) * SCORE_WEIGHTS.sleep +
    (exerciseScore / 100) * SCORE_WEIGHTS.exercise +
    (mealsScore / 100) * SCORE_WEIGHTS.meals +
    (waterScore / 100) * SCORE_WEIGHTS.water +
    (studyScore / 100) * SCORE_WEIGHTS.study +
    (screenTimeScore / 100) * SCORE_WEIGHTS.screen_time +
    (moodScore / 100) * SCORE_WEIGHTS.mood;

  return Math.round(Math.min(weighted, 100));
};

const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'S', label: 'Outstanding', color: '#FFD700' };
  if (score >= 80) return { grade: 'A', label: 'Excellent', color: '#4CAF50' };
  if (score >= 70) return { grade: 'B', label: 'Good', color: '#2196F3' };
  if (score >= 60) return { grade: 'C', label: 'Average', color: '#FF9800' };
  if (score >= 50) return { grade: 'D', label: 'Below Average', color: '#FF5722' };
  return { grade: 'F', label: 'Needs Improvement', color: '#F44336' };
};

const generateScoreBreakdown = (scores) => {
  const breakdown = [];

  if (scores.sleepScore !== undefined) {
    breakdown.push({
      category: 'Sleep',
      score: scores.sleepScore,
      weight: SCORE_WEIGHTS.sleep,
      contribution: Math.round((scores.sleepScore / 100) * SCORE_WEIGHTS.sleep),
    });
  }
  if (scores.exerciseScore !== undefined) {
    breakdown.push({
      category: 'Exercise',
      score: scores.exerciseScore,
      weight: SCORE_WEIGHTS.exercise,
      contribution: Math.round((scores.exerciseScore / 100) * SCORE_WEIGHTS.exercise),
    });
  }
  if (scores.mealsScore !== undefined) {
    breakdown.push({
      category: 'Meals',
      score: scores.mealsScore,
      weight: SCORE_WEIGHTS.meals,
      contribution: Math.round((scores.mealsScore / 100) * SCORE_WEIGHTS.meals),
    });
  }
  if (scores.waterScore !== undefined) {
    breakdown.push({
      category: 'Hydration',
      score: scores.waterScore,
      weight: SCORE_WEIGHTS.water,
      contribution: Math.round((scores.waterScore / 100) * SCORE_WEIGHTS.water),
    });
  }
  if (scores.studyScore !== undefined) {
    breakdown.push({
      category: 'Study',
      score: scores.studyScore,
      weight: SCORE_WEIGHTS.study,
      contribution: Math.round((scores.studyScore / 100) * SCORE_WEIGHTS.study),
    });
  }

  return breakdown;
};

module.exports = { calculateLifeScore, getScoreGrade, generateScoreBreakdown, SCORE_WEIGHTS };
