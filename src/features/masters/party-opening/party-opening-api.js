let openings = [
  {
    id: 1,
    party: "ABC Jewellers",
    metal: "Gold",
    type: "debit",
    debitWeight: 100,
    creditWeight: 0,
    year: "2024-25",
  },
];

export const getOpenings = () => Promise.resolve(openings);

export const addOpening = (data) => {
  data.id = openings.length + 1;
  openings.push(data);
  return Promise.resolve(data);
};

export const updateOpening = (data) => {
  openings = openings.map((o) => (o.id === data.id ? data : o));
  return Promise.resolve(data);
};

export const deleteOpening = (id) => {
  openings = openings.filter((o) => o.id !== id);
  return Promise.resolve();
};