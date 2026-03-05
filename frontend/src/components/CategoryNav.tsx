import { useNavigate } from 'react-router-dom';

export const CategoryNav = () => {
    const navigate = useNavigate();

    const handleFilter = (paramName: string, paramValue: string) => {
        navigate(`/buscar?${paramName}=${encodeURIComponent(paramValue)}`);
    };

    return (
        <nav className="category-nav">
            <ul className="category-list">
                
                <li className="category-item dropdown">
                    <span>Categorías ▾</span>
                    <ul className="dropdown-menu">
                        <li onClick={() => handleFilter('tipo_narracion', 'Literatura y ficción')}>Ficción y Literatura</li>
                        <li onClick={() => handleFilter('tipo_narracion', 'Historia')}>Historia</li>
                        <li onClick={() => handleFilter('tipo_narracion', 'Ciencia y Tecnología')}>Ciencia y Tecnología</li>
                    </ul>
                </li>
                
                <li className="category-item dropdown">
                    <span>Infantil y juvenil ▾</span>
                    <ul className="dropdown-menu">
                        <li onClick={() => handleFilter('edad_max', '12')}>Infantil (0 a 12 años)</li>
                        <li onClick={() => handleFilter('edad_min', '13')}>Juvenil (Young Adult)</li>
                    </ul>
                </li>

                <li className="category-item dropdown">
                    <span>Idioma ▾</span>
                    <ul className="dropdown-menu">
                        <li onClick={() => handleFilter('idioma', 'inglés')}>Libros en Inglés</li>
                        <li onClick={() => handleFilter('idioma', 'francés')}>Libros en Francés</li>
                    </ul>
                </li>
                
                <li className="category-item" onClick={() => handleFilter('tipo_narracion', 'Cómic y manga')}>
                    <span>Cómic y manga</span>
                </li>
                
            </ul>
        </nav>
    );
};