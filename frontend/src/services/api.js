import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3003",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // <— THIS is required so cookies are sent
});

// Response Interceptor - Handles errors globally
api.interceptors.response.use(
    (response) => {
        // If response is successful, just return it as-is
        return response;
    },
    (error) => {
        // If there's an error response from the server
        if (error.response) {
            // If status is 401 (Unauthorized), token is invalid/expired
            if (error.response.status === 401) {
                // Redirect to login page (only if not already on login/signup page)
                if (
                    window.location.pathname !== "/login" &&
                    window.location.pathname !== "/signup"
                ) {
                    window.location.href = "/login";
                }
            }
        }

        // Return the error so components can still handle it if needed
        return Promise.reject(error);
    },
);


export default api;
