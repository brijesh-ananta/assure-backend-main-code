import axiosToken from "../utils/axiosToken";

const binService = {
  getIssuerList: async (environment, cardType) => {
    const response = await axiosToken.get(
      `/bins/getIssuerList?environment=${environment}&cardType=${cardType}`
    );
    return response.data;
  },
  getIssuerData: async (issuerId) => {
    const response = await axiosToken.get(`/bins/getIssuerData/${issuerId}`);
    return response.data;
  },
  createBin: async (data) => {
    const response = await axiosToken.post("/bins/createBin", data);
    return response.data;
  },
  getBinsByEnv: async (environment, statusFilter, card_type) => {
    const params = { environment, card_type };

    // Add status filter if it's not "All" - convert to lowercase to match backend enum
    if (statusFilter && statusFilter !== "All") {
      params.status = statusFilter.toLowerCase();
    }
    // Building query string from parameters
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined) // Only include params that are defined
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`) // URL encode params to handle special characters
      .join("&");

    try {
      const url = `/bins/getAllBins${query ? `?${query}` : ""}`;
      const response = await axiosToken.get(url);
      return response.data;
    } catch (error) {
      console.error("Error in API call:", error);
      throw error; // Re-throw error to handle it in the fetchBins function
    }
  },
  updateBin: async (id, data) => {
    const response = await axiosToken.put(`/bins/update/${id}`, data);
    return response.data;
  },
  getBinById: async (id) => {
    const response = await axiosToken.get(`/bins/view/${id}`);
    return response.data;
  },
};

export default binService;
