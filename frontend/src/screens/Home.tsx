import { useState, useEffect } from 'react';
import { buscarLibrosPorTitulo } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const [busqueda, setBusqueda] = useState('');
    const [destacados, setDestacados] = useState<DetalleLibro[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDestacados = async () => {
            const librosPorDefecto = await buscarLibrosPorTitulo('Pablo Neruda'); 
            setDestacados(librosPorDefecto);
        };
        
        cargarDestacados();
    }, []);

    const ejecutarBusqueda = () => {
        if (!busqueda.trim()) return;

        navigate(`/buscar?q=${encodeURIComponent(busqueda)}`); 
    };

    return (
        <main>
            <section className="hero-section">
                <h1>Encontrá tu próxima lectura en<br />la librería más cercana</h1>
                <p className="hero-subtitle">Buscá entre miles de títulos disponibles.</p>
                
                <div className="search-box">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Ingresar título, autor o ISBN..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && ejecutarBusqueda()}
                    />
                    <button className="search-btn" onClick={ejecutarBusqueda}>
                        Buscar
                    </button>
                </div>
                
                <div className="location-hint">
                    Mostrando disponibilidad cerca de: <span>Florencio Varela</span> (Modificar)
                </div>
            </section>

            {/* Seccion de destacados */}
            <section className="content-section">
                <div className="section-title">
                    <h2>Los más buscados esta semana</h2>
                    <a href="#" className="view-all">Ver todos</a>
                </div>

                <div className="books-grid">
                    {destacados.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Cargando libros destacados...</p>
                    ) : (
                        destacados.map((libro) => (
                            <div className="book-card" key={libro.ean} onClick={() => navigate(`/libro/${libro.ean}`)} style={{ cursor: 'pointer' }}>
                                {libro.imagen_tapa ? (
                                    <img 
                                        src={libro.imagen_tapa} 
                                        alt={`Portada de ${libro.titulo}`} 
                                        className="book-cover-mock" 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <div className="book-cover-mock">Sin portada</div>
                                )}
                                <h3 className="book-title-mock">{libro.titulo}</h3>
                                <p className="book-author-mock">
                                    {libro.autor ? `${libro.autor.nombre} ${libro.autor.apellido}` : 'Autor no especificado'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
};