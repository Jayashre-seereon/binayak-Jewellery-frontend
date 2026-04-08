let stones = [
  {
    id: 1,
    alias: "ST-001",
    name: "Diamond",
    product: "Gold Ring",
    item: "Gold Ring Fancy",
  },
];

export const getStones = () => Promise.resolve(stones);

export const addStone = (data) => {
  data.id = stones.length + 1;
  stones.push(data);
  return Promise.resolve(data);
};

export const updateStone = (data) => {
  stones = stones.map((s) => (s.id === data.id ? data : s));
  return Promise.resolve(data);
};

export const deleteStone = (id) => {
  stones = stones.filter((s) => s.id !== id);
  return Promise.resolve();
};