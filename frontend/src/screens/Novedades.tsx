import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado, buscarLibroPorEan } from '../services/ultraService';
import { useWishlist } from '../context/WishlistContext';

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
    
    const [paginaActual, setPaginaActual] = useState(1);
    const [hayMasPaginas, setHayMasPaginas] = useState(false);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [totalLibros, setTotalLibros] = useState(0);

    const { toggleWishlist, isInWishlist } = useWishlist();

    const traerNovedades = async (pagina: number, esCargaInicial: boolean = false) => {
        if (esCargaInicial) setCargando(true);
        else setCargandoMas(true);

        const fecha = new Date();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        
        try {
            const dataBusqueda = await buscarLibrosAvanzado({ 
                novedades: `${mes}-${anio}`, 
                page: pagina 
            });
            
            if (!dataBusqueda.results || dataBusqueda.results.length === 0) {
                if (esCargaInicial) setCargando(false);
                return;
            }

            const librosConDetalle = await Promise.all(
                dataBusqueda.results.map(async (libroBasico: any) => { 
                    try { 
                        const detalle = await buscarLibroPorEan(libroBasico.ean); 
                        return { ...libroBasico, ...detalle }; 
                    } catch { return libroBasico; }
                })
            );
            
            if (esCargaInicial) {
                setLibros(librosConDetalle);
            } else {
                setLibros(prevLibros => [...prevLibros, ...librosConDetalle]);
            }

            setTotalLibros(dataBusqueda.count);
            setHayMasPaginas(dataBusqueda.next !== null);

        } catch (error) {
            console.error("Error cargando todas las novedades:", error);
        } finally {
            setCargando(false);
            setCargandoMas(false);
        }
    };

    useEffect(() => {
        traerNovedades(1, true);
    }, []);

    const cargarMasLibros = () => {
        const nuevaPagina = paginaActual + 1;
        setPaginaActual(nuevaPagina);
        traerNovedades(nuevaPagina, false);
    };

    return (
        <div className="search-page-container main-container">
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
                <h2 className="results-header" style={{ color: 'var(--text-dark)', margin: 0 }}>
                    Todas las novedades del mes
                </h2>
                {totalLibros > 0 && (
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Mostrando {libros.length} de {totalLibros} lanzamientos
                    </span>
                )}
            </div>

            {cargando ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>Buscando el catálogo completo de lanzamientos...</p>
            ) : libros.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>No se encontraron novedades este mes.</p>
            ) : (
                <>
                    <div className="results-list">
                        {libros.map((pub, index) => {
                            const precioMostrar = pub.en_librerias?.find((l: any) => Number(l.precio) > 0)?.precio;
                            
                            return (
                                <div key={`todas-${pub.ean}-${index}`} className="result-item" >
                                    
                                    <div className="result-item-top">
                                        
                                        <button className="wishlist-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist({
                                                    ean: pub.ean,
                                                    titulo: pub.titulo,
                                                    autor: formatearAutor(pub.autor),
                                                    imagen_tapa: pub.imagen_tapa,
                                                    libreria: 'Varias (Ver Disponibilidad)'
                                                });
                                            }}
                                            title={isInWishlist(pub.ean, 'Varias (Ver Disponibilidad)') ? "Quitar de favoritos" : "Agregar a favoritos"}
                                            >
                                            {isInWishlist(pub.ean, 'Varias (Ver Disponibilidad)') ? '❤️' : '🤍'}
                                        </button>

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
                                            
                                            <div className="result-price-novedades">
                                                {precioMostrar && Number(precioMostrar) > 0 ? (
                                                    `$${Number(precioMostrar).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                                ) : (
                                                    <div className="result-price">SIN STOCK </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                    <button className="btn-add-cart-novedades" onClick={() => navigate(`/libro/${pub.ean}`)}>
                                        VER DISPONIBILIDAD
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {hayMasPaginas && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button 
                                onClick={cargarMasLibros}
                                disabled={cargandoMas}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: 'var(--bg-white)',
                                    color: 'var(--text-dark)',
                                    border: '1px solid var(--text-dark)',
                                    borderRadius: '4px',
                                    cursor: cargandoMas ? 'wait' : 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s',
                                    opacity: cargandoMas ? 0.6 : 1
                                }}
                            >
                                {cargandoMas ? 'CARGANDO...' : 'CARGAR MÁS LIBROS'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};