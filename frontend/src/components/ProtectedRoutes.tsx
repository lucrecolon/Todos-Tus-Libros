import { Navigate } from 'react-router-dom';

export const RutaProtegida = ({ children }: { children: React.ReactNode }) => {
    const tokenC = document.cookie.includes('csrftoken');
    const tokenL = localStorage.getItem('authToken');
    const token = tokenC || tokenL;

    if (!token) {
        return <Navigate to="/" replace />;
    } else if (token) {
        return <>{children}</>;
    }
};