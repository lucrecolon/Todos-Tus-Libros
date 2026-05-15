import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado, buscarLibroPorEan } from '../services/ultraService'; 
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const SkeletonCard = () => (
    <div className="result-item">
        <div className="result-item-top">
            <div className="skeleton skeleton-img"></div>
            <div className="result-info">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-author"></div>
                <div className="skeleton skeleton-badge"></div>
                <div className="skeleton skeleton-price"></div>
            </div>
        </div>
        <div className="skeleton skeleton-btn"></div>
    </div>
);

export const BookSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { setCartOpen } = useCart();

    const queryTitulo = searchParams.get('titulo') || ''; 
    const queryAutor = searchParams.get('autor') || ''; 
    const queryEditorial = searchParams.get('editorial') || ''; 

    const [inputTitulo, setInputTitulo] = useState(queryTitulo);
    const [inputAutor, setInputAutor] = useState(queryAutor);
    const [inputEditorial, setInputEditorial] = useState(queryEditorial);

    const [cargando, setCargando] = useState(false);
    const [publicaciones, setPublicaciones] = useState<any[]>(() => {
        const guardados = sessionStorage.getItem('search_libros');
        return guardados ? JSON.parse(guardados) : [];
    });
    
    const [paginaActual, setPaginaActual] = useState(() => {
        const guardada = sessionStorage.getItem('search_pagina');
        return guardada ? parseInt(guardada) : 1;
    });
    
    const [hayMasResultados, setHayMasResultados] = useState(() => {
        const guardado = sessionStorage.getItem('search_hayMas');
        return guardado ? JSON.parse(guardado) : true;
    });

    const busquedaActiva = queryTitulo || queryAutor || queryEditorial;

    const [toast] = useState({ visible: false, mensaje: '' });
    
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

    const MIN_LIBROS_POR_CARGA = 6;

    const realizarBusqueda = async (paginaInicial: number, esNuevaBusqueda: boolean) => {
        if (!busquedaActiva) return;

        setCartOpen(false);
        setCargando(true);

        const queryLimpia = queryTitulo.replace(/[-\s]/g, '');
        const esBusquedaPorIsbn = /^\d{10,13}$/.test(queryLimpia) && !queryAutor && !queryEditorial;

        if (esBusquedaPorIsbn && esNuevaBusqueda) {
            const libroEncontrado = await buscarLibroPorEan(queryLimpia);
            if (libroEncontrado) {
                const tiendasValidas = (libroEncontrado.en_librerias || []).filter(
                    (tienda: any) => tienda.libreria !== 'Rit - test' && Number(tienda.precio) > 0
                );
                if (tiendasValidas.length > 0) {
                    setPublicaciones([{
                        ...libroEncontrado,
                        precio_mostrar: tiendasValidas[0].precio
                    }]);
                } else {
                    setPublicaciones([]);
                }
            } else {
                setPublicaciones([]);
            }
            
            setHayMasResultados(false);
            setCargando(false);
            return;
        }

        let paginaBuscando = paginaInicial;
        let listadoValido: any[] = [];
        let quedanPaginasEnAPI = true;

        while (listadoValido.length < MIN_LIBROS_POR_CARGA && quedanPaginasEnAPI) {
                const dataBusqueda = await buscarLibrosAvanzado({
                    titulo: queryTitulo,
                    autor: queryAutor,
                    editorial: queryEditorial,
                    page: paginaBuscando
                });

                quedanPaginasEnAPI = dataBusqueda.next !== null;

                if (dataBusqueda.results.length === 0) {
                    quedanPaginasEnAPI = false;
                    break;
                }

                const filtrados = dataBusqueda.results.reduce((acc: any[], libro: any) => {
                    
                    if (libro.precio && Number(libro.precio) > 8000) {
                        acc.push({
                            ...libro,
                            precio_mostrar: libro.precio 
                        });
                    }
                    return acc;
                }, []);

                listadoValido = [...listadoValido, ...filtrados];

                if (listadoValido.length < MIN_LIBROS_POR_CARGA && quedanPaginasEnAPI) {
                    paginaBuscando++;
                }
            }

            setPaginaActual(paginaBuscando);
            setHayMasResultados(quedanPaginasEnAPI);

            if (listadoValido.length > 0) {
                setPublicaciones(prev => esNuevaBusqueda ? listadoValido : [...prev, ...listadoValido]);
            } else if (esNuevaBusqueda) {
                setPublicaciones([]);
            }

            setCargando(false);
        };

    useEffect(() => {
        const ultimaBusqueda = sessionStorage.getItem('search_query');
        const busquedaActualStr = `${queryTitulo}|${queryAutor}|${queryEditorial}`;

        if (busquedaActiva) {
            if (ultimaBusqueda !== busquedaActualStr) {
                sessionStorage.removeItem('search_scroll');
                sessionStorage.setItem('search_query', busquedaActualStr);
                realizarBusqueda(1, true);
            } else {
                const scrollGuardado = sessionStorage.getItem('search_scroll');
                if (scrollGuardado && publicaciones.length > 0) {
                    setTimeout(() => {
                        window.scrollTo({
                            top: parseInt(scrollGuardado),
                            behavior: 'instant'
                        });
                    }, 200);
                }
            }
        } else {
            setPublicaciones([]);
            setHayMasResultados(true);
            sessionStorage.removeItem('search_query');
        }
    }, [queryTitulo, queryAutor, queryEditorial]);

    useEffect(() => {
        if (publicaciones.length > 0) {
            sessionStorage.setItem('search_libros', JSON.stringify(publicaciones));
            sessionStorage.setItem('search_pagina', paginaActual.toString());
            sessionStorage.setItem('search_hayMas', JSON.stringify(hayMasResultados));
        }
    }, [publicaciones, paginaActual, hayMasResultados]);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                sessionStorage.setItem('search_scroll', window.scrollY.toString());
            }, 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    const cargarMasLibros = () => {
        realizarBusqueda(paginaActual + 1, false);
    };

    const aplicarFiltros = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nuevosParametros = new URLSearchParams();

        const tituloLimpio = inputTitulo.trim();
        const autorLimpio = inputAutor.trim();
        const editorialLimpia = inputEditorial.trim();
        if (tituloLimpio) nuevosParametros.set('titulo', tituloLimpio);
        if (autorLimpio) nuevosParametros.set('autor', autorLimpio);
        if (editorialLimpia) nuevosParametros.set('editorial', editorialLimpia);
        
        setSearchParams(nuevosParametros);
    };

    const formatearPrecio = (precio: number | string) => {
        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(numero);
    };

    return (
        <div className="search-page-container main-container">
            
            {/* BARRA DE BUSQUEDA */}
            <div className="search-bar-wrapper">
                <form onSubmit={aplicarFiltros} className="advanced-search-form">
                    <div className="form-group">
                        <label className="form-label">Título / ISBN</label>
                        <input type="text" className="form-input" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} placeholder="Ej: Rayuela" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Autor (Apellido)</label>
                        <input type="text" className="form-input" value={inputAutor} onChange={(e) => setInputAutor(e.target.value)} placeholder="Ej: Cortazar" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Editorial</label>
                        <input type="text" className="form-input" value={inputEditorial} onChange={(e) => setInputEditorial(e.target.value)} placeholder="Ej: Sudamericana" />
                    </div>
                    <button type="submit" onSubmit={() => setCartOpen(false)} className="search-btn btn-add-cart" style={{ width: 'auto', padding: '11px 25px' }}>
                        BUSCAR
                    </button>
                </form>
            </div>

            {/* RESULTADOS */}
            <div>
                <h2 className="results-header">Resultados de Búsqueda</h2>
                
                {!busquedaActiva ? (
                    <div className="empty-state-prompt">
                        <p>Ingresá los datos en la barra superior para comenzar tu búsqueda.</p>
                    </div>
                ) : publicaciones.length === 0 && !cargando ? (
                    <div className="empty-state-error">
                        <p className="error-title">No se encontraron libros para esta búsqueda.</p>
                        <p className="error-subtitle">Verificá que el apellido del autor esté correcto o intentá con menos filtros.</p>
                    </div>
                ) : (
                    <>
                        <div className="results-list">
                            {publicaciones.map((pub, index) => (
                                <div key={`${pub.ean}-${index}`} className="result-item">

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
                                                <img src={pub.imagen_tapa} alt={pub.titulo} className="result-image" />
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

                                            <div className="result-price">{formatearPrecio(pub.precio_mostrar)}</div>
                                        </div>
                                    </div>

                                    <button 
                                        className="btn-add-cart"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/libro/${pub.ean}`);
                                            setCartOpen(false);
                                        }}
                                    >
                                        VER DISPONIBILIDAD
                                    </button>
                                    
                                </div>
                            ))}
                            {cargando && (
                            Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={`skeleton-${i}`} />
                            ))
                        )}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            {cargando && <p className="loading-text" style={{ textAlign: 'center', padding: '20px' }}>Buscando más publicaciones...</p>}
                            
                            {!cargando && hayMasResultados && publicaciones.length > 0 && (
                                <button onClick={cargarMasLibros} className="load-more-btn">
                                    Mostrar más resultados
                                </button>
                            )}
                            
                            {!hayMasResultados && publicaciones.length > 0 && (
                                <p className="end-results-text" style={{ textAlign: 'center' }}>Has llegado al final de los resultados.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className={`toast-notification ${toast.visible ? 'show' : ''}`}>
                ✅ {toast.mensaje}
            </div>
        </div>
    );
};