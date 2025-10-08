const API_BASE_URL = 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('hotel_token');
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    console.log('API Token check:', token ? 'Token found' : 'No token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('No token available for authentication');
    }
  }
  
  return headers;
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Rooms API
export const roomsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getAvailable: async (checkIn: string, checkOut: string, type?: string) => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      ...(type && { type }),
    });
    
    const response = await fetch(`${API_BASE_URL}/rooms/available?${params}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (roomData: any) => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse(response);
  },

  update: async (id: string, roomData: any) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Reservations API
export const reservationsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (reservationData: any) => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(reservationData),
    });
    return handleResponse(response);
  },

  update: async (id: string, reservationData: any) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(reservationData),
    });
    return handleResponse(response);
  },

  cancel: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
      method: 'PUT',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  checkIn: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/checkin`, {
      method: 'PUT',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  checkOut: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/checkout`, {
      method: 'PUT',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Billing API
export const billingApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/billings`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getMyBills: async (_customerId?: string) => {
    // Backend filters to current user when role is customer
    const response = await fetch(`${API_BASE_URL}/billings`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/billings/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (billingData: any) => {
    const response = await fetch(`${API_BASE_URL}/billings`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(billingData),
    });
    return handleResponse(response);
  },

  update: async (id: string, billingData: any) => {
    const response = await fetch(`${API_BASE_URL}/billings/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(billingData),
    });
    return handleResponse(response);
  },
};

// Reports API
export const reportsApi = {
  getDaily: async (date: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/daily?date=${date}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getMonthly: async (month: string, year: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/monthly?month=${month}&year=${year}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getDailyOccupancy: async (date?: string) => {
    const params = date ? `?date=${date}` : '';
    const response = await fetch(`${API_BASE_URL}/reports/daily-occupancy${params}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getNoShow: async (date?: string) => {
    const params = date ? `?date=${date}` : '';
    const response = await fetch(`${API_BASE_URL}/reports/no-show${params}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getHotelOccupancy: async (startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/hotel-occupancy?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getFinancial: async (startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/financial?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getCheckoutStatement: async (reservationId: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/checkout-statement/${reservationId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getRevenue: async (startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/revenue?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  create: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  update: async (id: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

export { ApiError };
