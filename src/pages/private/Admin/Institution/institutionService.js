import { initialDataInstitution } from "../../../../utilities/Config.utility";
import { request } from "../../../../services/config/axios_helper";
import { Institution } from "./models/Institution.model";

const institutionData = initialDataInstitution;

export const institutionService = {

    async getInstitutions() {
        try {
            const response = await request(
                'GET',
                'academy',
                `/institutions/nit/${institutionData.nit}`
            );

            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error getting data info:", error);
            throw error;
        }
    },

    async updateInstitution(institutionData) {
        console.log("institutionData", institutionData);
        const dataToSend = institutionData instanceof Institution
    ? institutionData.toBackend() 
    : institutionData;

        try {
            const response = await request(
                'PUT',
                'academy',
                `/institutions/${institutionData.id}`,
                dataToSend
            );

            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error updating institution:", error);
            throw error;
        }
    },

    async fetchFaimiliesReport() {
        try {
            const response = await request(
                'GET',
                'academy',
                `/users/detail/families/report`
            );
            
            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error getting data info:", error);
            throw error;
        }
    },

};