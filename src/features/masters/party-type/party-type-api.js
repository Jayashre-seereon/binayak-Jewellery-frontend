let partyTypes = [
  { id: 1, alias: "RTL", name: "Retail", description: "Retail customer" },
  { id: 2, alias: "WHL", name: "Wholesale", description: "Bulk buyers" },
];

export const getPartyTypes = () => Promise.resolve(partyTypes);

export const addPartyType = (data) => {
  data.id = partyTypes.length + 1;
  partyTypes.push(data);
  return Promise.resolve(data);
};

export const updatePartyType = (data) => {
  partyTypes = partyTypes.map((p) => (p.id === data.id ? data : p));
  return Promise.resolve(data);
};

export const deletePartyType = (id) => {
  partyTypes = partyTypes.filter((p) => p.id !== id);
  return Promise.resolve();
};