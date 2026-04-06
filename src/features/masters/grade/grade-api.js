let grades = [
  { id: 1, alias: "G1", name: "Grade 1", purity: "22K", percentage: 91.6, description: "Top grade" },
];

export const getGrades = () => {
  return Promise.resolve(grades);
};

export const addGrade = (data) => {
  data.id = grades.length + 1;
  grades.push(data);
  return Promise.resolve(data);
};

export const updateGrade = (data) => {
  grades = grades.map((g) => (g.id === data.id ? data : g));
  return Promise.resolve(data);
};

export const deleteGrade = (id) => {
  grades = grades.filter((g) => g.id !== id);
  return Promise.resolve();
};