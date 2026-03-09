import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado, buscarLibroPorEan } from '../services/ultraService'; 
import { useCart } from '../context/CartContext';

export const BookSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const queryTitulo = searchParams.get('titulo') || ''; 
    const queryAutor = searchParams.get('autor') || ''; 
    const queryEditorial = searchParams.get('editorial') || ''; 

    const [inputTitulo, setInputTitulo] = useState(queryTitulo);
    const [inputAutor, setInputAutor] = useState(queryAutor);
    const [inputEditorial, setInputEditorial] = useState(queryEditorial);

    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    
    const [pagina, setPagina] = useState(1);
    const [hayMasResultados, setHayMasResultados] = useState(true);

    const busquedaActiva = queryTitulo || queryAutor || queryEditorial;

    useEffect(() => {
        setPagina(1);
        setPublicaciones([]);
        setHayMasResultados(true);
    }, [queryTitulo, queryAutor, queryEditorial]);

    useEffect(() => {
        const fetchResultados = async () => {
            if (!busquedaActiva || !hayMasResultados) return;
            
            setCargando(true);
            const dataBusqueda = await buscarLibrosAvanzado({
                titulo: queryTitulo,
                autor: queryAutor,
                editorial: queryEditorial,
                page: pagina
            });
            
            if (dataBusqueda.length === 0) {
                setHayMasResultados(false);
                setCargando(false);
                return;
            }
            
            const librosConDetalle = await Promise.all(
                dataBusqueda.map(async (libroBasico: any) => {
                    try { return await buscarLibroPorEan(libroBasico.ean); } 
                    catch { return libroBasico; }
                })
            );
            
            const listadoAplanado = librosConDetalle.flatMap(libro => 
                (libro.en_librerias || [])
                    .filter((tienda: any) => tienda.libreria !== 'Rit - test' && Number(tienda.precio) > 0)
                    .map((tienda: any) => ({
                        ...libro, 
                        precio_tienda: tienda.precio,
                        nombre_libreria: tienda.libreria,
                        stock_tienda: tienda.stock
                    }))
            );
            
            setPublicaciones(prev => pagina === 1 ? listadoAplanado : [...prev, ...listadoAplanado]);
            setCargando(false);
        };

        fetchResultados();
    }, [queryTitulo, queryAutor, queryEditorial, pagina]);

    const aplicarFiltros = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nuevosParametros = new URLSearchParams();
        if (inputTitulo) nuevosParametros.set('titulo', inputTitulo);
        if (inputAutor) nuevosParametros.set('autor', inputAutor);
        if (inputEditorial) nuevosParametros.set('editorial', inputEditorial);
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
                    <button type="submit" className="search-btn btn-add-cart" style={{ width: 'auto', padding: '11px 25px' }}>
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
                                <div key={`${pub.ean}-${pub.nombre_libreria}-${index}`} className="result-item">

                                    <div className="result-item-top">
                                        <div className="result-image-wrapper" onClick={() => navigate(`/libro/${pub.ean}`)}>
                                            {pub.imagen_tapa ? (
                                                <img src={pub.imagen_tapa} alt={pub.titulo} className="result-image" />
                                            ) : (
                                                <div className="book-cover-mock" style={{ height: '135px' }}>Sin portada</div>
                                            )}
                                        </div>

                                        <div className="result-info">
                                            <h3 className="result-title" onClick={() => navigate(`/libro/${pub.ean}`)}>{pub.titulo}</h3>
                                            <p className="result-author">Por {pub.autor ? `${pub.autor.nombre} ${pub.autor.apellido}` : 'Autor no especificado'}</p>
                                            
                                            <div className="vendor-badge">
                                                <p className="vendor-title">Vendido por: {pub.nombre_libreria}</p>
                                                <p className="vendor-stock">Stock: {pub.stock_tienda} unidades</p>
                                            </div>

                                            <div className="result-price">{formatearPrecio(pub.precio_tienda)}</div>
                                        </div>
                                    </div>

                                    <button 
                                        className="btn-add-cart"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart({ ean: pub.ean, titulo: pub.titulo, precio: Number(pub.precio_tienda), libreria: pub.nombre_libreria });
                                        }}
                                    >
                                        AGREGAR AL CARRITO
                                    </button>
                                    
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            {cargando && <p className="loading-text" style={{ textAlign: 'center', padding: '20px' }}>Buscando más publicaciones...</p>}
                            
                            {!cargando && hayMasResultados && publicaciones.length > 0 && (
                                <button onClick={() => setPagina(prev => prev + 1)} className="load-more-btn">
                                    Mostrar más resultados ↓
                                </button>
                            )}
                            
                            {!hayMasResultados && publicaciones.length > 0 && (
                                <p className="end-results-text" style={{ textAlign: 'center' }}>Has llegado al final de los resultados.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};