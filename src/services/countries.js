import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class CountriesService {
  constructor() {}
  async get({ env }) {
    try {
      const result = await axiosToken.get(`/countries?environment=${env}`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async create(data) {
    try {
      const result = await axiosToken.post("/countries", data);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async getById(id) {
    try {
      const result = await axiosToken.get(`/countries/${id}`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async updateStatus(body, id) {
    try {
      const result = await axiosToken.put(`/countries/${id}`, body);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }
}

export default new CountriesService();
