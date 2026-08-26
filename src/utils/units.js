export const roundMoney = (val) =>
  Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;

export const money = (val) => roundMoney(val).toFixed(2);

// Weight formatter: default 3 decimal places for grams/kg, integer for pcs
export const weightStr = (val) => Number(val || 0).toFixed(3);

export const formatUnit = (val, unit) => {
  const n = Number(val || 0);
  switch ((unit || "").toString().toLowerCase()) {
    case "g":
    case "gm":
      return `${n.toFixed(3)} gm`;
    case "kg":
      return `${n.toFixed(3)} kg`;
    case "pcs":
    case "pc":
      return `${Number.isInteger(n) ? n : n.toFixed(0)} pcs`;
    case "%":
      return `${n.toFixed(2)}%`;
    default:
      return `${n}`;
  }
};

export default {
  roundMoney,
  money,
  weightStr,
  formatUnit,
};
