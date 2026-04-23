/**
 * Utility to safely format error messages from API responses.
 * Handles FastAPI validation errors (objects/arrays) and regular error strings.
 */
export const formatErrorMessage = (err) => {
    if (!err) return "An unknown error occurred";
    
    // Check if it's an Axios error object
    const responseData = err.response?.data;
    const detail = responseData?.detail;

    if (detail) {
        // Handle FastAPI validation error list (422 Unprocessable Entity)
        if (Array.isArray(detail)) {
            // Extract the location and message for each error
            return detail.map(d => {
                const field = d.loc ? d.loc[d.loc.length - 1] : "field";
                return `${field}: ${d.msg}`;
            }).join(", ");
        }
        
        // Handle single string detail
        if (typeof detail === "string") {
            return detail;
        }
        
        // Fallback for other objects
        return JSON.stringify(detail);
    }

    // Fallback to generic error message
    return err.message || "An unexpected error occurred";
};
