import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface UiOnlyRouteProps {
    children: React.ReactNode;
}

const UiOnlyRoute: React.FC<UiOnlyRouteProps> = ({ children }) => {
    const location = useLocation();
    const state = location.state as { fromUi?: boolean } | null;

    if (!state?.fromUi) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default UiOnlyRoute;
