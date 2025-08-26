import axiosToken from "../utils/axiosToken";

const TestCaseService = {
  // Already present
  getTestCasesList: async (environment, cardType) => {
  const response = await axiosToken.get(`/test-cases?environment=${environment}&cardType=${cardType}`);
  return response.data; // ✅ This means the calling code should expect `response.data`, i.e., the array.
},

  // New: Get a test case by ID
  getTestCaseById: async (id) => {
    const response = await axiosToken.get(`/test-cases/${id}`);
    return response.data;
  },

  // New: Create a test case
  createTestCase: async (data) => {
    const response = await axiosToken.post(`/test-cases`, data);
    return response.data;
  },

  // New: Update a test case
  updateTestCase: async (id, data) => {
    const response = await axiosToken.put(`/test-cases/${id}`, data);
    return response.data;
  },

  // New: Delete a test case
  deleteTestCase: async (id) => {
    const response = await axiosToken.delete(`/test-cases/${id}`);
    return response.data;
  }
};


export default TestCaseService;
