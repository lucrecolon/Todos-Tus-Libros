import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buscarLibroPorEan } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';

export const BookDetails = () => {
    const { ean } = useParams(); 
    
    const [libro, setLibro] = useState<DetalleLibro | null>(null);
    const [cargando, setCargando] = useState(true);

    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const cargarDatos = async () => {
            if (ean) {
                const datos = await buscarLibroPorEan(ean);
                setLibro(datos);
            }
            setCargando(false);
        };
        cargarDatos();
    }, [ean]);

    if (cargando) return <h2 style={{ padding: '40px', textAlign: 'center' }}>Cargando libro...</h2>;
    if (!libro) return <h2 style={{ padding: '40px', textAlign: 'center' }}>No se encontró el libro.</h2>;

    return (
        <>
            <div className="location-bar">
                Mostrando disponibilidad cerca de: Florencio Varela
            </div>

            <div className="main-container">
                {/* FICHA DEL LIBRO */}
                <div className="book-details">
                    {libro.imagen_tapa ? (
                        <img src={libro.imagen_tapa} alt={libro.titulo} className="book-cover" style={{ objectFit: 'cover' }} />
                    ) : (
                        <div className="book-cover">Portada no disponible</div>
                    )}
                    
                    <h1 className="book-title" style={{ textTransform: 'capitalize' }}>{libro.titulo}</h1>
                    <div className="book-author">
                        {libro.autor ? `${libro.autor.nombre} ${libro.autor.apellido}` : 'Autor desconocido'}
                    </div>
                    
                    {/* Si viene sinopsis la mostramos, sino un mensaje por defecto */}
                    <div className="book-synopsis">
                        {libro.sinopsis ? libro.sinopsis.substring(0, 300) + '...' : 'Sinopsis no disponible para esta edición.'}
                    </div>
                    
                    <div className="book-meta">
                        <p><strong>EAN / ISBN:</strong> {libro.ean}</p>
                        <p><strong>Editorial:</strong> {libro.editorial?.nombre || 'No especificada'}</p>
                        <p><strong>Precio Base:</strong> ${libro.precio}</p>
                    </div>
                </div>

                {/* LISTA DE LIBRERÍAS */}
                <div className="bookstores-list">
                    <div className="list-header">
                        <h2>Opciones de compra</h2>
                    </div>

                    {/* Filtramos para no mostrar las que tienen stock 0 (opcional) */}
                    {libro.en_librerias?.filter(l => l.stock > 0).length === 0 ? (
                        <p>No hay librerías con stock disponible en este momento.</p>
                    ) : (
                        libro.en_librerias?.filter(l => l.stock > 0).map((tienda, index) => (
                            <div className="store-card" key={index}>
                                <div className="store-info">
                                    <h3>{tienda.libreria}</h3>
                                    <div className="store-distance">
                                        Disponibilidad: {tienda.stock} unidad(es) en stock
                                    </div>
                                </div>
                                <div className="store-action">
                                    <span className="price">${tienda.precio}</span>
                                    <button 
                                        className="btn-add" 
                                        onClick={() => {
                                            setCartCount(cartCount + 1);
                                            setCartOpen(true);
                                        }}
                                    >
                                        Añadir a la compra
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CARRITO */}
            <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`} id="cart-sidebar">
                <div className="cart-header">
                    <h2>Mi Selección ({cartCount})</h2>
                    <button className="close-btn" onClick={() => setCartOpen(false)}>Cerrar</button>
                </div>
                <p className="cart-notice">La facturación y el pago se procesan de forma segura en la plataforma individual de cada librería.</p>
                <div id="cart-content">
                    {cartCount === 0 ? (
                        <p style={{ textAlign: 'center', color: '#999', marginTop: '50px', fontSize: '14px' }}>No hay artículos seleccionados.</p>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#27ae60', marginTop: '50px' }}>¡Libro añadido al carrito temporal!</p>
                    )}
                </div>
            </div>
        </>
    );
};