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
    const [libros, setLibros] = useState<any[]>(() => {
        const guardados = sessionStorage.getItem('nov_libros');
        return guardados ? JSON.parse(guardados) : [];
    });
    
    const [cargando, setCargando] = useState(() => {
        return sessionStorage.getItem('nov_libros') ? false : true;
    });
    
    const [paginaActual, setPaginaActual] = useState(() => {
        const guardado = sessionStorage.getItem('nov_pagina');
        return guardado ? parseInt(guardado) : 1;
    });
    
    const [hayMasPaginas, setHayMasPaginas] = useState(() => {
        const guardado = sessionStorage.getItem('nov_hayMas');
        return guardado ? JSON.parse(guardado) : false;
    });
    
    const [totalLibros, setTotalLibros] = useState(() => {
        const guardado = sessionStorage.getItem('nov_total');
        return guardado ? parseInt(guardado) : 0;
    });

    const [cargandoMas, setCargandoMas] = useState(false);

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
                setLibros([...libros, ...librosConDetalle]);
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
        if (libros.length > 0) {
            sessionStorage.setItem('nov_libros', JSON.stringify(libros));
            sessionStorage.setItem('nov_pagina', paginaActual.toString());
            sessionStorage.setItem('nov_hayMas', JSON.stringify(hayMasPaginas));
            sessionStorage.setItem('nov_total', totalLibros.toString());
        }
    }, [libros, paginaActual, hayMasPaginas, totalLibros]);

    useEffect(() => {
        if (libros.length === 0) {
            traerNovedades(1, true);
        } else {
            const scrollGuardado = sessionStorage.getItem('nov_scroll');
            if (scrollGuardado) {
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(scrollGuardado),
                        behavior: 'instant'
                    });
                }, 200);
            }
        }
    }, []);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                sessionStorage.setItem('nov_scroll', window.scrollY.toString());
            }, 50);
        };

        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    const cargarMasLibros = () => {
        const nuevaPagina = paginaActual + 1;
        setPaginaActual(nuevaPagina);
        traerNovedades(nuevaPagina, false);
    };

    return (
        <div className="search-page-container main-container">
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid var(--text-muted)', paddingBottom: '10px' }}>
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
                            <button className="load-more-btn"
                                onClick={cargarMasLibros}
                                disabled={cargandoMas}
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