import http from "./axios";

export const getGrades = async () => {
  const res = await http.get("/api/grades/get");
  return res.data?.data ?? [];
};

export const getGradeById = async (id) => {
  const res = await http.get(`/api/grades/getById/${id}`);
  return res.data?.data ?? null;
};

export const addGrade = async (data) => {
  const res = await http.post("/api/grades/create", data);
  return res.data;
};

export const updateGrade = async (id, data) => {
  const res = await http.put(`/api/grades/update/${id}`, data);
  return res.data;
};

export const deleteGrade = async (id) => {
  const res = await http.delete(`/api/grades/delete/${id}`);
  return res.data;
};
