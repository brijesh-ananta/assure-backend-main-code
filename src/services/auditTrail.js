import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class AuditTrailService {
  constructor() {}

  async getById(id) {
    try {
      const result = await axiosToken.get(`/audit-trails/${id}`);
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

export default new AuditTrailService();
