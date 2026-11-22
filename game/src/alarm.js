// alarm.js — the alarm meter: the single number that decides a catch.
// Being seen fills it (cameras faster than guards, shadow halves the rate);
// hiding lets it drain. A catch needs the meter full AND the thief to have
// been visibly spotted for the grace period, so the "!" warning is always fair.

import { ALARM_MAX, ALARM_DECAY, GUARD_SEEN_RATE, CAMERA_SEEN_RATE, SPOT_GRACE } from './config.js';

export function makeAlarm() {
  return { value: 0, spottedFor: 0, tripped: false };
}

// seenByGuard / seenByCamera are booleans this frame; inShadow halves the rise.
export function updateAlarm(alarm, dt, seenByGuard, seenByCamera, inShadow) {
  const seen = seenByGuard || seenByCamera;
  if (seen) {
    alarm.spottedFor += dt;
    let rate = 0;
    if (seenByGuard) rate += GUARD_SEEN_RATE;
    if (seenByCamera) rate += CAMERA_SEEN_RATE;
    if (inShadow) rate *= 0.5;
    alarm.value = Math.min(ALARM_MAX, alarm.value + rate * dt);
  } else {
    alarm.spottedFor = 0;
    alarm.value = Math.max(0, alarm.value - ALARM_DECAY * dt);
  }
  // A catch only lands after the grace warning has run its course.
  alarm.tripped = alarm.value >= ALARM_MAX && alarm.spottedFor >= SPOT_GRACE;
  return alarm.tripped;
}

export function alarmColour(value) {
  if (value < 35) return '#39d98a';
  if (value < 70) return '#ffb62e';
  return '#e03939';
}
