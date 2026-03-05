import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buscarLibrosPorTitulo, buscarLibroPorEan } from '../services/ultraService'; 
import { useCart } from '../context/CartContext';

export const BookSearch = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const query = searchParams.get('q') || ''; 
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const fetchResultados = async () => {
            if (query) {
                setCargando(true);
                
                const dataBusqueda = await buscarLibrosPorTitulo(query);
                
                const librosConDetalle = await Promise.all(
                    dataBusqueda.map(async (libroBasico) => {
                        try {
                            return await buscarLibroPorEan(libroBasico.ean);
                        } catch (error) {
                            return libroBasico;
                        }
                    })
                );
                
                const listadoAplanado = librosConDetalle.flatMap(libro => 
                    (libro.en_librerias || [])
                        //.filter(tienda => tienda.stock > 0)
                        .filter(tienda =>(tienda.libreria !== 'Rit - test') && (tienda.libreria !== 'ultralibreria') && tienda.stock > 0)
                        .map(tienda => ({
                            ...libro, 
                            precio_tienda: tienda.precio,
                            nombre_libreria: tienda.libreria,
                            stock_tienda: tienda.stock
                        }))
                );
                
                setPublicaciones(listadoAplanado);
                setCargando(false);
            }
        };

        fetchResultados();
    }, [query]);

    const formatearPrecio = (precio: number | string) => {
        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(numero);
    };

    return (
        <div className="main-container" style={{ flexDirection: 'column', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <div className="search-header" style={{ marginBottom: '30px', borderBottom: '2px solid var(--primary-green)', paddingBottom: '10px' }}>
                <h2 style={{ color: 'var(--primary-green)' }}>Resultados para: "{query}"</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Se encontraron {publicaciones.length} opciones de compra
                </p>
            </div>

            {cargando ? (
                <p>Buscando disponibilidad y precios en las librerías...</p>
            ) : publicaciones.length === 0 ? (
                <p>No se encontraron librerías con stock para esta búsqueda.</p>
            ) : (
                <div className="search-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {publicaciones.map((pub, index) => (
                        <div 
                            key={`${pub.ean}-${pub.nombre_libreria}-${index}`} 
                            style={{ 
                                display: 'flex', 
                                backgroundColor: 'var(--bg-white)', 
                                border: '1px solid var(--border-color)', 
                                padding: '20px',
                                gap: '25px',
                                transition: 'box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div 
                                style={{ width: '120px', flexShrink: 0, cursor: 'pointer' }}
                                onClick={() => navigate(`/libro/${pub.ean}`)}
                            >
                                {pub.imagen_tapa ? (
                                    <img src={pub.imagen_tapa} alt={pub.titulo} style={{ width: '100%', height: 'auto', objectFit: 'contain', border: '1px solid var(--border-color)' }} />
                                ) : (
                                    <div className="book-cover-mock" style={{ height: '180px' }}>Sin portada</div>
                                )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h3 
                                    style={{ margin: '0 0 8px 0', fontSize: '22px', color: 'var(--text-dark)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/libro/${pub.ean}`)}
                                >
                                    {pub.titulo}
                                </h3>
                                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    Por {pub.autor ? `${pub.autor.nombre} ${pub.autor.apellido}` : 'Autor no especificado'}
                                </p>
                                
                                <div style={{ backgroundColor: 'var(--bg-paper)', padding: '10px 15px', borderRadius: '4px', display: 'inline-block', width: 'fit-content' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--primary-green)', fontWeight: 'bold' }}>
                                        Vendido por: {pub.nombre_libreria}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#27ae60' }}>
                                        Stock: {pub.stock_tienda} unidades
                                    </p>
                                </div>
                            </div>

                            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '25px' }}>
                                <div style={{ fontSize: '28px', color: 'var(--text-dark)', fontFamily: 'Georgia, serif', marginBottom: '15px' }}>
                                    {formatearPrecio(pub.precio_tienda)}
                                </div>
                                <button 
                                    className="search-btn"
                                    style={{ backgroundColor: 'var(--primary-green)', width: '100%', padding: '12px', fontSize: '13px' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart({
                                            ean: pub.ean,
                                            titulo: pub.titulo,
                                            precio: Number(pub.precio_tienda),
                                            libreria: pub.nombre_libreria
                                        });
                                    }}
                                >
                                    AGREGAR AL CARRITO
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};