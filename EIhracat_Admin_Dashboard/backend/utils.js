export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function generateCode(prefix = "X") {
  const dt = new Date();
  const pad = n => String(n).padStart(2, "0");
  const stamp = `${String(dt.getFullYear()).slice(-2)}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
  const rand = Math.floor(10 + Math.random() * 90);
  return `${prefix}${stamp}${rand}`;
}
