import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado, buscarLibroPorEan } from '../services/ultraService';

const formatearAutor = (autor: any): string => {
    if (!autor) return 'Autor desconocido';
    if (typeof autor === 'string') return autor;
    return `${autor.nombre || ''} ${autor.apellido || ''}`.trim() || 'Autor desconocido';
};

const formatearEditorial = (editorial: any): string => {
    if (!editorial) return 'No especificada';
    if (typeof editorial === 'string') return editorial;
    return editorial.nombre || 'No especificada';
};

export const Novedades = () => {
    const navigate = useNavigate();
    const [libros, setLibros] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchTodasLasNovedades = async () => {
            const fecha = new Date();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            
            try {
                const dataBusqueda = await buscarLibrosAvanzado({ novedades: `${mes}-${anio}` });
                
                if (!dataBusqueda || dataBusqueda.length === 0) {
                    setCargando(false);
                    return;
                }

                const librosConDetalle = await Promise.all(
                    dataBusqueda.map(async (libroBasico: any) => { 
                        try { 
                            const detalle = await buscarLibroPorEan(libroBasico.ean); 
                            return { ...libroBasico, ...detalle }; 
                        } catch { return libroBasico; }
                    })
                );
                
                setLibros(librosConDetalle);
            } catch (error) {
                console.error("Error cargando todas las novedades:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchTodasLasNovedades();
    }, []);

    return (
        <div className="search-page-container main-container">
            <h2 className="results-header" style={{ marginBottom: '30px', color: 'var(--text-dark)' }}>
                Todas las novedades del mes
            </h2>

            {cargando ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>Buscando el catálogo completo de lanzamientos...</p>
            ) : libros.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>No se encontraron novedades este mes.</p>
            ) : (
                <div className="results-list">
                    {libros.map((pub, index) => {
                        const precioMostrar = pub.en_librerias?.find((l: any) => Number(l.precio) > 0)?.precio;
                        
                        return (
                            <div key={`todas-${pub.ean}-${index}`} className="result-item">
                                <div className="result-item-top">
                                    <div className="result-image-wrapper" onClick={() => navigate(`/libro/${pub.ean}`)}>
                                        {pub.imagen_tapa ? (
                                            <img src={pub.imagen_tapa} alt={pub.titulo} className="result-image" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div className="book-cover-mock" style={{ height: '135px' }}>Sin portada</div>
                                        )}
                                    </div>
                                    <div className="result-info">
                                        <h3 className="result-title" onClick={() => navigate(`/libro/${pub.ean}`)}>{pub.titulo}</h3>
                                        <p className="result-author">Por {formatearAutor(pub.autor)}</p>
                                        <div className="vendor-badge">
                                            <p className="vendor-title">Editorial: {formatearEditorial(pub.editorial)}</p>
                                        </div>
                                        {precioMostrar && (
                                            <div className="result-price">${Number(precioMostrar).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                                        )}
                                    </div>
                                </div>
                                <button className="btn-add-cart" onClick={() => navigate(`/libro/${pub.ean}`)}>
                                    VER DISPONIBILIDAD
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};