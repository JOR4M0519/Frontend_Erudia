// configurationService.js

import { request } from "../../../../../services/config/axios_helper";

export const configurationService = {
  // Dimensiones
  getDimensions: async () => {
    try {
      const response = await request("GET", "academy", "/dimensions");
      return response.data;
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      throw error;
    }
  },
  
  createDimension: async (dimension) => {
    try {
      const response = await request("POST", "academy", "/dimensions", dimension);
      return response.data;
    } catch (error) {
      console.error("Error creating dimension:", error);
      throw error;
    }
  },
  
  updateDimension: async (id, dimension) => {
    try {
      const response = await request("PUT", "academy", `/dimensions/${id}`, dimension);
      return response.data;
    } catch (error) {
      console.error("Error updating dimension:", error);
      throw error;
    }
  },
  
  deleteDimension: async (id) => {
    try {
      await request("DELETE", "academy", `/dimensions/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting dimension:", error);
      throw error;
    }
  },
  
  // Materias
  createSubject: async (dimensionId, subject) => {
    try {
      const response = await request("POST", "academy", `/dimensions/${dimensionId}/subjects`, subject);
      return response.data;
    } catch (error) {
      console.error("Error creating subject:", error);
      throw error;
    }
  },
  
  updateSubject: async (dimensionId, subjectId, subject) => {
    try {
      const response = await request("PUT", "academy", `/dimensions/${dimensionId}/subjects/${subjectId}`, subject);
      return response.data;
    } catch (error) {
      console.error("Error updating subject:", error);
      throw error;
    }
  },
  
  deleteSubject: async (dimensionId, subjectId) => {
    try {
      await request("DELETE", "academy", `/dimensions/${dimensionId}/subjects/${subjectId}`);
      return true;
    } catch (error) {
      console.error("Error deleting subject:", error);
      throw error;
    }
  }
};

export default configurationService;
