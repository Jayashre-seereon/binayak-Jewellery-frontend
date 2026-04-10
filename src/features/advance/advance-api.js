let advances = [];

export const getAdvances = () => Promise.resolve(advances);

export const addAdvance = (data) => {
  data.id = advances.length + 1;
  advances.push(data);
  return Promise.resolve(data);
};

export const updateAdvance = (data) => {
  advances = advances.map((a) =>
    a.id === data.id ? data : a
  );
  return Promise.resolve(data);
};

export const deleteAdvance = (id) => {
  advances = advances.filter((a) => a.id !== id);
  return Promise.resolve();
};