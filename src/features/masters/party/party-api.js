let parties = [
  {
    id: 1,
    alias: "CUST001",
    name: "ABC Jewellers",
    type: "Retail",
    ledger: "Sales Ledger",
    gst: "22AAAAA0000A1Z5",
    phone: "9876543210",
    address: "Bhubaneswar",
  },
];

export const getParties = () => Promise.resolve(parties);

export const addParty = (data) => {
  data.id = parties.length + 1;
  parties.push(data);
  return Promise.resolve(data);
};

export const updateParty = (data) => {
  parties = parties.map((p) => (p.id === data.id ? data : p));
  return Promise.resolve(data);
};

export const deleteParty = (id) => {
  parties = parties.filter((p) => p.id !== id);
  return Promise.resolve();
};