import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class UserService {
  constructor() {}

  async getById(id) {
    try {
      const result = await axiosToken.get(`/users/getUserData/${id}`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async logoutUser() {
    try {
      const result = await axiosToken.post(`/users/logout`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async getUserLoginHistory(id) {
    try {
      const result = await axiosToken.get(`/users/login-history/${id}`);
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

export default new UserService();
