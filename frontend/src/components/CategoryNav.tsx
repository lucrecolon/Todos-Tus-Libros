import { useNavigate, useLocation } from 'react-router-dom';

export const CategoryNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === '/') {
        return null;
    }

    return (
        <nav className="category-nav">
            <button className="btn-volver" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i> Volver
            </button>
        </nav>
    );
};