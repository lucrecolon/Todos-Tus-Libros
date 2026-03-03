import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buscarLibroPorEan } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';
import { useCart } from '../context/CartContext';

export const BookDetails = () => {
    const { ean } = useParams(); 
    
    const [libro, setLibro] = useState<DetalleLibro | null>(null);
    const [cargando, setCargando] = useState(true);

    const { setCartOpen, cartCount, setCartCount } = useCart();

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
                    
                    {/*sino hay sinopsis se muestra un mensaje por defecto */}
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

                    {/* filtro para no mostrar las que tienen stock 0 (opcional) */}
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
        </>
    );
};