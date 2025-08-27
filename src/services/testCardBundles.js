import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class TestCardBundlesService {
  constructor() {}

  async get() {
    try {
      const result = await axiosToken.get(`/test-card-bundles`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async create(body) {
    try {
      const result = await axiosToken.post("/test-card-bundles", body);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async update(id, body) {
    try {
      const result = await axiosToken.put(`/test-card-bundles/${id}`, body);
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

export default new TestCardBundlesService();
