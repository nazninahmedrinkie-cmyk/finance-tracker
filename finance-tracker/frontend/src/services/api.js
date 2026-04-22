import axios from "axios";

const API_URL = "http://localhost/finance-tracker/backend/api/";

export const registerUser = (data) => {
  return axios.post(API_URL + "auth/register.php", data);
};

export const loginUser = (data) => {
  return axios.post(API_URL + "auth/login.php", data);
};

export const getTransactions = (userId) => {
  return axios.get(API_URL + "transactions/read.php?user_id=" + userId);
};

export const addTransaction = (data) => {
  return axios.post(API_URL + "transactions/create.php", data);
};

export const getSummary = (userId) => {
  return axios.get(API_URL + "dashboard/summary.php?user_id=" + userId);
};

// GET CATEGORIES
export const getCategories = () => {
  return axios.get(API_URL + "categories/read.php");
};

// UPDATE TRANSACTION
export const updateTransaction = (data) => {
  return axios.post(API_URL + "transactions/update.php", data);
};

// DELETE TRANSACTION (optional but recommended)
export const deleteTransaction = (id) => {
  return axios.delete(API_URL + "transactions/delete.php?id=" + id);
};

// ADD CATEGORY
export const addCategory = (data) => {
  return axios.post(API_URL + "categories/create.php", data);
};