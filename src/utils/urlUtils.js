/**
 * Ensures a URL is absolute by prepending http:// if no protocol is present.
 * Prevents internal routing issues where external links are treated as relative paths.
 * 
 * @param {string} url - The URL to format
 * @returns {string} - The absolute URL
 */
export const formatExternalUrl = (url) => {
    if (!url) return "";
    
    // Check if the URL already has a protocol
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    
    // If it starts with //, just prepend http:
    if (url.startsWith("//")) {
        return `http:${url}`;
    }
    
    // Prepend http:// by default
    return `http://${url}`;
};
