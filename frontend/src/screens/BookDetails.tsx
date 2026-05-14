import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buscarLibroPorEan } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';
import { useCart } from '../context/CartContext';
import libreriasLocal from '../data/librerias.json';
import { calcularDistancia } from '../utils/utils';

export const BookDetails = () => {
    const { ean } = useParams(); 
    
    const [libro, setLibro] = useState<DetalleLibro | null>(null);
    const [cargando, setCargando] = useState(true);

    const { addToCart } = useCart();
    const [ toast, setToast ] = useState({ visible: false, mensaje: '' });

    const [ubicacionUsuario, setUbicacionUsuario] = useState<{lat: number, lng: number} | null>(null);

    const mostrarToast = (tituloLibro: string) => {
        setToast({ visible: true, mensaje: `"${tituloLibro}" agregado al carrito` });
        
        setTimeout(() => {
            setToast({ visible: false, mensaje: '' });
        }, 3000);
    };

    const pedirUbicacion = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUbicacionUsuario({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("El usuario lo rechazó en el navegador:", error);
                }
            );
        }
    };

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

    const formatearPrecio = (precio: number | string) => {
        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(numero);
    };

    if (cargando) return <h2 style={{ padding: '40px', textAlign: 'center' }}>Cargando libro...</h2>;
    if (!libro) return <h2 style={{ padding: '40px', textAlign: 'center' }}>No se encontró el libro.</h2>;

    const libreriasConDistancia = (libro.en_librerias || []).map((tiendaAPI) => {
        const datosLocales = libreriasLocal.find((lib: any) => lib.nombre.toUpperCase() === tiendaAPI.libreria.toUpperCase());
        
        let distancia = null;
        if (ubicacionUsuario && datosLocales && datosLocales.lat && datosLocales.lng) {
            distancia = calcularDistancia(ubicacionUsuario.lat, ubicacionUsuario.lng, datosLocales.lat, datosLocales.lng);
        }

        return {
            ...tiendaAPI,
            direccionInfo: datosLocales ? datosLocales.direccion : 'Dirección no disponible',
            distancia: distancia
        };
    });

    const libreriasConStock = libreriasConDistancia.filter(l => l.stock > 0);


    const libreriasOrdenadas = [...libreriasConStock].sort((a, b) => {
        if (a.distancia === null) return 1;
        if (b.distancia === null) return -1;
        return a.distancia - b.distancia;
    });

    return (
        <>
            <div className="location-bar">
                {ubicacionUsuario 
                    ? 'Mostrando librerías ordenadas por cercanía' 
                    : 'Mostrando disponibilidad en todas las sucursales:'}
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
                    
                    <div className="book-synopsis">
                        {libro.sinopsis ? libro.sinopsis.substring(0, 3000) + '...' : 'Sinopsis no disponible para esta edición.'}
                    </div>
                    
                    <div className="book-meta">
                        <p><strong>EAN / ISBN:</strong> {libro.ean}</p>
                        <p><strong>Editorial:</strong> {libro.editorial?.nombre || 'No especificada'}</p>
                    </div>
                </div>

                {/* LISTA DE LIBRERÍAS */}
                <div className="bookstores-list">
                    <div className="list-header">
                        <h2>Opciones de compra</h2>
                    </div>
                    {!ubicacionUsuario && (
                        <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #c8e6c9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary-green)' }}>📍 Encontrá este libro más rápido</h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                    Permitinos ver tu ubicación para ordenar la lista con las librerías más cercanas
                                </p>
                            </div>
                            <button 
                                onClick={pedirUbicacion}
                                style={{ backgroundColor: 'var(--accent-bordeaux)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Ver librerías cercanas
                            </button>
                        </div>
                    )}

                    {libreriasOrdenadas.length === 0 ? (
                        <p>No hay librerías con stock disponible en este momento.</p>
                    ) : (
                        libreriasOrdenadas.map((tienda, index) => (
                            <div className="store-card" key={index}>
                                <div className="store-info">
                                    <h3>{tienda.libreria}</h3>
                                    
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                                        {tienda.direccionInfo}
                                    </p>
                                    
                                    {tienda.distancia !== null && (
                                        <p style={{ margin: '5px 0', color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '14px' }}>
                                            A {tienda.distancia.toFixed(1)} km de distancia
                                        </p>
                                    )}

                                    <div className="store-distance" style={{ marginTop: '10px' }}>
                                        Disponibilidad: {tienda.stock} unidad(es) en stock
                                    </div>
                                </div>
                                <div className="store-action">
                                    <span className="price">{formatearPrecio(tienda.precio)}</span>
                                    <button
                                        className="btn-add"
                                        onClick={() => {
                                            addToCart({
                                                ean: libro.ean,
                                                titulo: libro.titulo,
                                                precio: Number(tienda.precio), 
                                                libreria: tienda.libreria
                                            });
                                            mostrarToast(libro.titulo);
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
            <div className={`toast-notification ${toast.visible ? 'show' : ''}`}>
                ✅ {toast.mensaje}
            </div>
        </>
    );
};