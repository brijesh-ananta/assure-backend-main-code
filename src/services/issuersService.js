import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class CardProfileService {
  constructor() {}

  async getByEnv(environment = 1, statusFilter = "All", cardType = "All") {
    try {
      let url = `/issuers/get-all-issuers-new?environment=${environment}&cardType=${cardType}`;
      if (statusFilter !== "All") {
        url += `&status=${statusFilter}`;
      }
      const result = await axiosToken.get(url);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async getIssuerInfoById(id, environment) {
    try {
      const result = await axiosToken.get(
        `/issuers/${id}?environment=${environment}`
      );
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

export default new CardProfileService();
