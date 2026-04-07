let designs = [
  { id: 1, alias: "RNG", name: "Ring", description: "Ring design" },
  { id: 2, alias: "NKL", name: "Necklace", description: "Necklace design" },
];

export const getDesigns = () => {
  return Promise.resolve(designs);
};

export const addDesign = (data) => {
  data.id = designs.length + 1;
  designs.push(data);
  return Promise.resolve(data);
};

export const updateDesign = (data) => {
  designs = designs.map((d) => (d.id === data.id ? data : d));
  return Promise.resolve(data);
};

export const deleteDesign = (id) => {
  designs = designs.filter((d) => d.id !== id);
  return Promise.resolve();
};