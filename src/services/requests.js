import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class RequestsService {
  constructor() {}

  async getById(id) {
    try {
      const result = await axiosToken.get(`/card-requests/${id}`);
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

export default new RequestsService();
