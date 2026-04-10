let transfers = [];

export const getTransfers = () => Promise.resolve(transfers);

export const addTransfer = (data) => {
  data.id = transfers.length + 1;
  transfers.push(data);
  return Promise.resolve(data);
};

export const deleteTransfer = (id) => {
  transfers = transfers.filter((t) => t.id !== id);
  return Promise.resolve();
};