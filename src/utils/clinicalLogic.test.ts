import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePhq9,
  evaluateGad7,
  validateBookingInput,
  computeWellnessSummary,
  buildWellnessChartData,
  validateCbtEntry,
  toggleEmpathyReaction,
  computePostEmpathySummary,
} from './clinicalLogic';

test('evaluatePhq9 rejects incomplete responses and identifies missing item indices', () => {
  const incomplete = [1, 0, null, 2, 1, 0, null, 1, 0];
  const res = evaluatePhq9(incomplete);
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.deepEqual(res.missingIndices, [3, 7]);
  }
});

test('evaluatePhq9 computes accurate severity tiers and triggers safety check on item 9', () => {
  const minimal = evaluatePhq9([0, 1, 0, 1, 0, 0, 1, 0, 0]);
  assert.equal(minimal.ok, true);
  if (minimal.ok) {
    assert.equal(minimal.result.totalScore, 3);
    assert.equal(minimal.result.severity, 'Minimal');
    assert.equal(minimal.result.requiresSafetyCheck, false);
  }

  const safetyFlagged = evaluatePhq9([1, 1, 1, 1, 0, 1, 1, 0, 1]);
  assert.equal(safetyFlagged.ok, true);
  if (safetyFlagged.ok) {
    assert.equal(safetyFlagged.result.totalScore, 7);
    assert.equal(safetyFlagged.result.severity, 'Mild');
    assert.equal(safetyFlagged.result.requiresSafetyCheck, true);
  }

  const severe = evaluatePhq9([3, 3, 2, 3, 2, 3, 3, 2, 0]);
  assert.equal(severe.ok, true);
  if (severe.ok) {
    assert.equal(severe.result.totalScore, 21);
    assert.equal(severe.result.severity, 'Severe');
    assert.equal(severe.result.requiresSafetyCheck, true);
  }
});

test('evaluateGad7 computes accurate anxiety severity tiers', () => {
  const moderate = evaluateGad7([2, 2, 2, 1, 2, 1, 1]);
  assert.equal(moderate.ok, true);
  if (moderate.ok) {
    assert.equal(moderate.result.totalScore, 11);
    assert.equal(moderate.result.severity, 'Moderate');
    assert.equal(moderate.result.recommendedSpecialty, 'Anxiety & Panic');
  }
});

test('validateBookingInput enforces university .edu email and required fields', () => {
  const invalidEmail = validateBookingInput({
    studentName: 'maya lin',
    studentEmail: 'maya@gmail.com',
    studentId: 'STU-409128',
    counselorId: 'c-1',
    slot: 'Thu, Oct 29 · 14:00',
    modality: 'In-Person Campus Clinic',
    reason: 'Experiencing severe thesis defense anxiety and insomnia.',
  });
  assert.equal(invalidEmail.valid, false);
  if (!invalidEmail.valid) {
    assert.ok(invalidEmail.errors.studentEmail);
  }

  const validBooking = validateBookingInput({
    studentName: 'Maya Lin',
    studentEmail: 'maya.lin@university.edu',
    studentId: 'STU-409128',
    counselorId: 'c-1',
    slot: 'Thu, Oct 29 · 14:00',
    modality: 'In-Person Campus Clinic',
    reason: 'Experiencing severe thesis defense anxiety and insomnia.',
  });
  assert.equal(validBooking.valid, true);
});

test('computeWellnessSummary calculates averages and burnout risk correctly', () => {
  const summary = computeWellnessSummary([
    { id: '1', date: '2026-10-24', moodScore: 2, sleepHours: 5.5, academicStress: 8, notes: 'Midterm week' },
    { id: '2', date: '2026-10-25', moodScore: 2, sleepHours: 5.0, academicStress: 9, notes: 'Lab report deadline' },
  ]);
  assert.equal(summary.avgMood, 2);
  assert.equal(summary.avgSleep, 5.3);
  assert.equal(summary.avgStress, 8.5);
  assert.equal(summary.burnoutRisk, 'High');
});

test('validateCbtEntry validates cognitive restructuring fields', () => {
  const res = validateCbtEntry({
    situation: 'Organic chemistry midterm grade posted',
    automaticThought: 'One B- means my graduate school application is ruined.',
    distortion: 'Catastrophizing & All-or-Nothing Thinking',
    evidenceAgainst: 'Advisors evaluate research trajectory and cumulative GPA.',
    reframedThought: 'A single midterm grade does not define my research capability or overall GPA.',
    distressBefore: 85,
    distressAfter: 35,
  });
  assert.equal(res.valid, true);
});

test('buildWellnessChartData sorts logs chronologically and computes deltas and restorative sleep count', () => {
  const insights = buildWellnessChartData([
    { id: '2', date: '2026-10-25', moodScore: 4, sleepHours: 7.5, academicStress: 5, notes: 'Recovered' },
    { id: '1', date: '2026-10-22', moodScore: 2, sleepHours: 5.5, academicStress: 8, notes: 'Midterm' },
    { id: '3', date: '2026-10-24', moodScore: 3, sleepHours: 7.0, academicStress: 6, notes: 'Steady' },
  ]);
  assert.equal(insights.series.length, 3);
  assert.deepEqual(
    insights.series.map((p) => p.shortDate),
    ['10-22', '10-24', '10-25']
  );
  assert.equal(insights.moodDelta, 2);
  assert.equal(insights.sleepDelta, 2);
  assert.equal(insights.optimalSleepDays, 2);
  assert.equal(insights.bestDayLabel, '10-25 (7.5h · 4/5)');
});

test('toggleEmpathyReaction increments and decrements Send a Hug, Relate, and Rooting for You accurately', () => {
  const initial = {
    hugs: 24,
    relates: 41,
    rooting: 15,
    userHugged: false,
    userRelated: false,
    userRooted: false,
  };

  const afterHug = toggleEmpathyReaction(initial, 'hug');
  assert.equal(afterHug.hugs, 25);
  assert.equal(afterHug.userHugged, true);

  const afterRelate = toggleEmpathyReaction(afterHug, 'relate');
  assert.equal(afterRelate.relates, 42);
  assert.equal(afterRelate.userRelated, true);

  const afterRooting = toggleEmpathyReaction(afterRelate, 'rooting');
  assert.equal(afterRooting.rooting, 16);
  assert.equal(afterRooting.userRooted, true);

  const summary = computePostEmpathySummary(afterRooting, 'AnonFox_21');
  assert.equal(summary.totalSupportCount, 83);
  assert.deepEqual(summary.activeReactions, ['hug', 'relate', 'rooting']);
  assert.equal(
    summary.supportiveFeedbackText,
    "You sent a warm hug, shared that you relate, and are rooting for them — AnonFox_21 knows they aren't alone."
  );

  const unHugged = toggleEmpathyReaction(afterRooting, 'hug');
  assert.equal(unHugged.hugs, 24);
  assert.equal(unHugged.userHugged, false);
});


