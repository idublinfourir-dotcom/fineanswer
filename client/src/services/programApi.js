import axios from "axios";
import { API_BASE_URL } from "../config/api";

/**
 * Search programs from the Google Sheets data source via the backend.
 *
 * @param {{ level?: string, country?: string, category?: string, intake?: string }} params
 * @returns {Promise<object[]>}
 */
export const searchPrograms = ({ level = "", country = "", category = "", intake = "" }) =>
  axios
    .get(`${API_BASE_URL}/programs/search`, {
      params: { level, country, category, intake },
    })
    .then((res) => res.data);
