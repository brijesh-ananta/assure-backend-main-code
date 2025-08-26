import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class CardService {
  constructor() {}
  async getById(id) {
    try {
      const result = await axiosToken.get(`/notifications/${id}`);
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

export default new CardService();
