const pad = (num, size) => {
  let s = String(num);
  while (s.length < size) s = `0${s}`;
  return s;
};

const generateReceiptNumber = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1, 2);
  const dd = pad(now.getDate(), 2);
  const rand = pad(Math.floor(Math.random() * 100000), 5);
  return `RCPT-${yyyy}${mm}${dd}-${rand}`;
};

module.exports = { generateReceiptNumber };
