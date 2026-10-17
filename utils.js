function validDateTime(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now();
}

function validDuration(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 15 && n <= 120 && n % 15 === 0;
}

function overlaps(startA, durationA, startB, durationB) {
  const a1 = new Date(startA).getTime();
  const a2 = a1 + Number(durationA) * 60000;
  const b1 = new Date(startB).getTime();
  const b2 = b1 + Number(durationB) * 60000;
  return a1 < b2 && b1 < a2;
}

module.exports = { validDateTime, validDuration, overlaps };
