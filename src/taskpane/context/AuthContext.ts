import React from "react";

const AuthContext = React.createContext<any>({});
export const AuthProvider = AuthContext.Provider;
export default AuthContext;
