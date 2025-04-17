const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const API_URL = process.env.BOOKING_API_URL;
const AUTH_HEADER = {
  headers: {
    Authorization:
      "Basic RzVaMFAxSzNUMkMyWjdBNDp5Tzl5TTVxWTh1RDBmUDFjWjZnRTNsUjNjQzNjRDNyWg==",
  },
};

const catalogCities = async () => {
  try {
    const response = await axios.post(
      `https://devcoreservicesfna.customersolutions.click/api/v1/catalog/cities`,
      {},
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog cities:", error);
  }
};

const catalogBranchOffices = async () => {
  try {
    const response = await axios.post(
      `https://devcoreservicesfna.customersolutions.click/api/v1/catalog/branchOffices`,
      {},
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog branch offices:", error);
  }
};

const catalogDepartments = async (branchOfficeId) => {
  try {
    const response = await axios.post(
      `https://devcoreservicesfna.customersolutions.click/api/v1/catalog/departments`,
      { branchOfficeId },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog departments:", error);
  }
};

const findByServiceAndDay = async (
  datePetition,
  branchOfficeId,
  departmentId
) => {
  try {
    const response = await axios.post(
      `https://devcoreservicesfna.customersolutions.click/api/v1/schedule-checker/findByServiceAndDay`,
      { datePetition, branchOfficeId, departmentId },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules by service and day:", error);
  }
};

const findByServiceAndMultipleDays = async (
  datePetition,
  branchOfficeId,
  departmentId
) => {
  try {
    const response = await axios.post(
      `${API_URL}/schedule-checker/findByServiceAndMultipleDays`,
      { datePetition, branchOfficeId, departmentId },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching schedules by service and multiple days:",
      error
    );
  }
};

const findByCityAndDay = async (datePetition, cityName) => {
  try {
    const response = await axios.post(
      `${API_URL}/schedule-checker/findByCityAndDay`,
      { datePetition, cityName },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules by city and day:", error);
  }
};

const findPetition = async (document, phone) => {
  try {
    const response = await axios.post(
      `${API_URL}/petition-checker/findPetition`,
      { document, phone },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error finding petition:", error);
  }
};

const createPetition = async (
  fullName,
  phone,
  email,
  gender,
  document,
  documentType,
  branchOfficeId,
  departmentId,
  date,
  time
) => {
  try {
    const response = await axios.post(
      `${API_URL}/petition-checker/createPetition`,
      {
        fullName,
        phone,
        email,
        gender,
        document,
        documentType,
        branchOfficeId,
        departmentId,
        date,
        time,
      },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error creating petition:", error);
  }
};

const updatePetition = async (
  petitionId,
  branchOfficeId,
  departmentId,
  date,
  time
) => {
  try {
    const response = await axios.post(
      `${API_URL}/petition-checker/updatePetition`,
      { petitionId, branchOfficeId, departmentId, date, time },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error updating petition:", error);
  }
};

const cancelPetition = async (petitionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/petition-checker/cancelPetition`,
      { petitionId },
      AUTH_HEADER
    );
    return response.data;
  } catch (error) {
    console.error("Error canceling petition:", error);
  }
};

module.exports = {
  catalogCities,
  catalogBranchOffices,
  catalogDepartments,
  findByServiceAndDay,
  findByServiceAndMultipleDays,
  findByCityAndDay,
  findPetition,
  createPetition,
  updatePetition,
  cancelPetition,
};
