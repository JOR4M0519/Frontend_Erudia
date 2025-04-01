import apiEndpoints from "../../../../Constants/api-endpoints";
import { request } from "../../../../services/config/axios_helper";



export const systemService = {

    async getUsers() {
        try {
            const response = await request(
                'GET',
                apiEndpoints.SERVICES.ACADEMY,
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


};