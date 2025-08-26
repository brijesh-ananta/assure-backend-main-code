import axiosToken from "../utils/axiosToken";
import { handleErrorToaster } from "../utils/function";

class CardService {
  constructor() {}

  async get(params) {
    try {
      const result = await axiosToken.get("/cards", {params});
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async importCard(data) {
    try {
      const result = await axiosToken.post("/cards/import-card-data", data);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async createCard(data) {
    try {
      const result = await axiosToken.post("/cards", data);
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
      const result = await axiosToken.get(`/cards/${id}`);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }
  
  async getCardHistory(id) {
    try {
      const result = await axiosToken.post("/user-cards/get-user-card-usage", {userId: id});
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async updateStatus(body) {
    try {
      const result = await axiosToken.put('/cards/update-card-status', body);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
    
  }

  async updateCardData(body) {
    try {
      const result = await axiosToken.put('/cards/update-card-data-new', body);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      handleErrorToaster(error);
    }
  }

  async searchCard(body) {
    try {
      const result = await axiosToken.post('/cards/search-card', body);
      if (result.status === 200 || result.status === 201) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error('error',error)
      handleErrorToaster(error);
    }
  }
}

export default new CardService();
