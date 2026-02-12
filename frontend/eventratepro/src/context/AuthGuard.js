import { useAuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";

function LoginGuard({ children }) {
    const { User, loading } = useAuthContext();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (User === null || User === undefined) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default LoginGuard;
