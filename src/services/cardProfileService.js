import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class CardProfileService {
  constructor() {}

  async get(params) {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const result = await axiosToken.get(`/profiles?${searchParams}`);
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
      const result = await axiosToken.get(`/profiles/${id}`);
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
      const result = await axiosToken.post("/profiles", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }
  async update(id, data) {
    try {
      // Check if data is FormData (for file uploads)
      const isFormData = data instanceof FormData;

      const config = {};
      if (isFormData) {
        // For FormData, set multipart/form-data header
        config.headers = {
          "Content-Type": "multipart/form-data",
        };
      }

      const result = await axiosToken.put(`/profiles/${id}`, data, config);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async delete() {
    try {
      const result = await axiosToken.get("/profiles");
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async getAvailableCards(params) {
    try {
      const result = await axiosToken.get(`/profiles/get_available_cards`, {
        params,
      });
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async getCardDetails(id) {
    try {
      const result = await axiosToken.get(`/profiles/get-card-details/${id}`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async assignCard(body) {
    try {
      const result = await axiosToken.post(`/profiles/assign-card`, body);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async releaseCard(userCardId, profileId, body = {}) {
    try {
      const result = await axiosToken.post(
        `/profiles/release-card?userCardId=${userCardId}?profileId=${profileId}`,
        body
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
