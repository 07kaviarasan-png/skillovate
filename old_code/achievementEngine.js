/**
 * Achievement Engine — Automatically evaluates student data and awards achievements.
 * Called after test submissions, interview completions, placement updates, etc.
 * 
 * RULE: All achievements are system-generated. No manual creation.
 */
const Achievement = require('./Achievement');
const TestAttempt = require('./TestAttempt');
const Interview = require('./Interview');
const Placement = require('./Placement');
const User = require('./User');

/**
 * Try to award an achievement. Silently skips if already exists (duplicate).
 */
async function tryAward(data) {
  try {
    await Achievement.create(data);
    return true;
  } catch (err) {
    if (err.code === 11000) return false; // duplicate — already awarded
    throw err;
  }
}

/**
 * Evaluate after a test submission.
 */
async function evaluateAfterTest(studentId, collegeId, testAttempt) {
  const awarded = [];

  // TOP SCORER — Score > 90%
  if (testAttempt.percentage > 90) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'top_scorer',
      title: 'Top Scorer',
      description: `Scored ${testAttempt.percentage}% on ${testAttempt.testName}`,
      sourceModule: 'test',
      referenceId: testAttempt._id,
      metricValue: testAttempt.percentage,
      achievedAt: new Date()
    });
    if (ok) awarded.push('top_scorer');
  }

  // FAST SOLVER — Completed test in under 50% of expected time (assume 3600s standard)
  if (testAttempt.timeTaken && testAttempt.timeTaken < 1800 && testAttempt.percentage >= 60) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'fast_solver',
      title: 'Fast Solver',
      description: `Completed ${testAttempt.testName} in ${Math.round(testAttempt.timeTaken / 60)} mins with ${testAttempt.percentage}%`,
      sourceModule: 'test',
      referenceId: testAttempt._id,
      metricValue: testAttempt.timeTaken,
      achievedAt: new Date()
    });
    if (ok) awarded.push('fast_solver');
  }

  // CONSISTENT PERFORMER — 5 tests above 80%
  const highScoreCount = await TestAttempt.countDocuments({
    studentId,
    percentage: { $gte: 80 }
  });
  if (highScoreCount >= 5) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'consistent_performer',
      title: 'Consistent Performer',
      description: `${highScoreCount} tests scored above 80%`,
      sourceModule: 'test',
      metricValue: highScoreCount,
      achievedAt: new Date()
    });
    if (ok) awarded.push('consistent_performer');
  }

  // IMPROVEMENT STAR — Last 3 tests show upward trend
  const lastTests = await TestAttempt.find({ studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('percentage')
    .lean();
  if (lastTests.length >= 3) {
    const [latest, mid, oldest] = lastTests;
    if (latest.percentage > mid.percentage && mid.percentage > oldest.percentage) {
      const ok = await tryAward({
        studentId, collegeId,
        type: 'improvement_star',
        title: 'Improvement Star',
        description: `Score trend: ${oldest.percentage}% → ${mid.percentage}% → ${latest.percentage}%`,
        sourceModule: 'test',
        metricValue: latest.percentage,
        achievedAt: new Date()
      });
      if (ok) awarded.push('improvement_star');
    }
  }

  return awarded;
}

/**
 * Evaluate after an interview submission.
 */
async function evaluateAfterInterview(studentId, collegeId, interview) {
  const awarded = [];

  // EXCELLENT COMMUNICATOR — Rating > 8 (out of 10)
  if (interview.overallRating >= 8) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'excellent_communicator',
      title: 'Excellent Communicator',
      description: `Rated ${interview.overallRating}/10 for ${interview.role} interview`,
      sourceModule: 'interview',
      referenceId: interview._id,
      metricValue: interview.overallRating,
      achievedAt: new Date()
    });
    if (ok) awarded.push('excellent_communicator');
  }

  // INTERVIEW READY — Completed 5+ interviews
  const totalInterviews = await Interview.countDocuments({ studentId });
  if (totalInterviews >= 5) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'interview_ready',
      title: 'Interview Ready',
      description: `Completed ${totalInterviews} mock interviews`,
      sourceModule: 'interview',
      metricValue: totalInterviews,
      achievedAt: new Date()
    });
    if (ok) awarded.push('interview_ready');
  }

  // CONFIDENCE BOOSTER — Last 3 interviews show rating improvement
  const lastIVs = await Interview.find({ studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('overallRating')
    .lean();
  if (lastIVs.length >= 3) {
    const [latest, mid, oldest] = lastIVs;
    if (latest.overallRating > mid.overallRating && mid.overallRating > oldest.overallRating) {
      const ok = await tryAward({
        studentId, collegeId,
        type: 'confidence_booster',
        title: 'Confidence Booster',
        description: `Interview ratings trending up: ${oldest.overallRating} → ${mid.overallRating} → ${latest.overallRating}`,
        sourceModule: 'interview',
        metricValue: latest.overallRating,
        achievedAt: new Date()
      });
      if (ok) awarded.push('confidence_booster');
    }
  }

  return awarded;
}

/**
 * Evaluate after a placement update.
 */
async function evaluateAfterPlacement(studentId, collegeId, placement) {
  const awarded = [];

  // PLACED CANDIDATE
  if (placement.status === 'placed') {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'placed_candidate',
      title: 'Placed Candidate',
      description: `Placed at ${placement.companyName} as ${placement.role}`,
      sourceModule: 'placement',
      referenceId: placement._id,
      metricValue: placement.salaryLPA,
      achievedAt: new Date()
    });
    if (ok) awarded.push('placed_candidate');
  }

  // DREAM OFFER — Above 10 LPA
  if (placement.status === 'placed' && placement.salaryLPA >= 10) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'dream_offer',
      title: 'Dream Offer Achiever',
      description: `Offer of ${placement.salaryLPA} LPA from ${placement.companyName}`,
      sourceModule: 'placement',
      referenceId: placement._id,
      metricValue: placement.salaryLPA,
      achievedAt: new Date()
    });
    if (ok) awarded.push('dream_offer');
  }

  // ACTIVE APPLICANT — Applied to 5+ companies
  const totalApplications = await Placement.countDocuments({ studentId });
  if (totalApplications >= 5) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'active_applicant',
      title: 'Active Applicant',
      description: `Applied to ${totalApplications} companies`,
      sourceModule: 'placement',
      metricValue: totalApplications,
      achievedAt: new Date()
    });
    if (ok) awarded.push('active_applicant');
  }

  return awarded;
}

/**
 * Evaluate system-level / engagement achievements for a student.
 * Called periodically or on-demand.
 */
async function evaluateEngagement(studentId, collegeId) {
  const awarded = [];
  const user = await User.findById(studentId).lean();
  if (!user) return awarded;

  // CONSISTENT LEARNER — Streak >= 7 days
  if (user.stats && user.stats.streak >= 7) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'consistent_learner',
      title: 'Consistent Learner',
      description: `${user.stats.streak}-day activity streak`,
      sourceModule: 'system',
      metricValue: user.stats.streak,
      achievedAt: new Date()
    });
    if (ok) awarded.push('consistent_learner');
  }

  // HIGH PERFORMER — avgAccuracy >= 85 and testsCompleted >= 10
  if (user.stats && user.stats.avgAccuracy >= 85 && user.stats.testsCompleted >= 10) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'high_performer',
      title: 'High Performer',
      description: `${user.stats.avgAccuracy}% average across ${user.stats.testsCompleted} tests`,
      sourceModule: 'system',
      metricValue: user.stats.avgAccuracy,
      achievedAt: new Date()
    });
    if (ok) awarded.push('high_performer');
  }

  // TOP 10 RANKER — National rank <= 10
  if (user.stats && user.stats.nationalRank && user.stats.nationalRank <= 10) {
    const ok = await tryAward({
      studentId, collegeId,
      type: 'top_10_ranker',
      title: 'Top 10 Ranker',
      description: `National Rank #${user.stats.nationalRank}`,
      sourceModule: 'system',
      metricValue: user.stats.nationalRank,
      achievedAt: new Date()
    });
    if (ok) awarded.push('top_10_ranker');
  }

  return awarded;
}

module.exports = {
  evaluateAfterTest,
  evaluateAfterInterview,
  evaluateAfterPlacement,
  evaluateEngagement
};
