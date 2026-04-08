let employees = [
  {
    id: 1,
    code: "EMP001",
    alias: "emp1",
    name: "John Doe",
    fatherName: "Robert Doe",
    doj: "2024-01-01",
    phone: "1234567890",
    mobile: "9876543210",
    email: "john@example.com",
    website: "www.john.com",
    account: "123456789",
    bank: "HDFC",
    basic: 20000,
    allowance: 5000,
    address1: "Street 1",
    address2: "City",
  },
];

export const getEmployees = () => Promise.resolve(employees);

export const addEmployee = (data) => {
  data.id = employees.length + 1;
  employees.push(data);
  return Promise.resolve(data);
};

export const updateEmployee = (data) => {
  employees = employees.map((e) => (e.id === data.id ? data : e));
  return Promise.resolve(data);
};

export const deleteEmployee = (id) => {
  employees = employees.filter((e) => e.id !== id);
  return Promise.resolve();
};