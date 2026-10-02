import { createContext } from "react";

// Kept in its own file so ContextProvider.jsx only exports a component (React Fast Refresh)
export const AuthContext = createContext(null);
