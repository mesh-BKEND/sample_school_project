const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload?.error ||
      payload?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload;
}

export const api = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  getUsers() {
    return request("/users");
  },
  getTeachers() {
    return request("/teachers");
  },
  createTeacher(teacher) {
    return request("/teachers", {
      method: "POST",
      body: JSON.stringify(teacher),
    });
  },
  getStudents(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return request(`/students${queryString ? `?${queryString}` : ""}`);
  },
  createStudent(student) {
    return request("/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
  },
  getFees(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return request(`/fees${queryString ? `?${queryString}` : ""}`);
  },
  createFeeRecord(feeRecord) {
    return request("/fees", {
      method: "POST",
      body: JSON.stringify(feeRecord),
    });
  },
  getAttendance(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return request(`/attendance${queryString ? `?${queryString}` : ""}`);
  },
  saveAttendanceBatch(payload) {
    return request("/attendance/batch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getStudentPerformance(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return request(`/performance/student${queryString ? `?${queryString}` : ""}`);
  },
  saveStudentPerformance(payload) {
    return request("/performance/student", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  approveStudentPerformance(id) {
    return request(`/performance/student/${id}/approve`, {
      method: "POST",
    });
  },
  getClassPerformance(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return request(`/performance/class${queryString ? `?${queryString}` : ""}`);
  },
  saveClassPerformance(payload) {
    return request("/performance/class", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  approveClassPerformance(id) {
    return request(`/performance/class/${id}/approve`, {
      method: "POST",
    });
  },
};
