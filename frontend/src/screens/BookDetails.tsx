import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buscarLibroPorEan } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';
import { useCart } from '../context/CartContext';
import libreriasLocal from '../data/librerias.json';
import { calcularDistancia } from '../utils/utils';
import { AuthModal } from '../components/AuthModal';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { obtenerPerfilUsuario } from '../services/ultraService';

export const BookDetails = () => {
    const { ean } = useParams(); 
    
    const [libro, setLibro] = useState<DetalleLibro | null>(null);
    const [cargando, setCargando] = useState(true);

    const { addToCart } = useCart();
    const [ toast, setToast ] = useState({ visible: false, mensaje: '' });

    const [ubicacionUsuario, setUbicacionUsuario] = useState<{lat: number, lng: number} | null>(null);

    const [mostrarModalAuth, setMostrarModalAuth] = useState(false);

    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState<any>(null);

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
            
            const token = document.cookie.includes('csrftoken');
            if (token) {
                try {
                    const userProfile = await obtenerPerfilUsuario();
                    setPerfil(userProfile);
                    setIsLoggedIn(true);
                } catch (e) {
                    setIsLoggedIn(false);
                }
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

    // Filtramos solo las direcciones que tienen coordenadas y armamos las opciones
    const opcionesUbicacion = [
        { value: 'gps', label: '📍 Usar mi ubicación actual' },
        ...(perfil?.user_addresses || [])
            .filter((dir: any) => dir.latitude && dir.longitude)
            .map((dir: any) => ({
                value: dir.id,
                label: `🏠 ${dir.street} ${dir.number}${dir.main ? ' (Principal)' : ''}`
            })),
        { value: 'add_new', label: '➕ Agregar nueva dirección...' }
    ];

    const handleUbicacionChange = (option: any) => {
        setOpcionSeleccionada(option);
        
        if (option.value === 'gps') {
            pedirUbicacion();
        } else if (option.value === 'add_new') {
            navigate('/user/me?add=true');
        } else {
            const dir = perfil?.user_addresses.find((d: any) => d.id === option.value);
            if (dir && dir.latitude && dir.longitude) {
                setUbicacionUsuario({
                    lat: dir.latitude,
                    lng: dir.longitude
                });
            }
        }
    };

    return (
        <>
            <div className="location-bar">
                {ubicacionUsuario 
                    ? 'Mostrando librerías ordenadas por cercanía' 
                    : 'Mostrando disponibilidad en todas las sucursales'}
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
                    {/* LÓGICA DEL SELECTOR DE UBICACIÓN */}
                    <div style={{ marginBottom: '25px', padding: '20px', background: '#e8f5e9', borderRadius: '6px', border: '1px solid #c8e6c9;' }}>
                        <h4 style={{ margin: '0 0 3px 0', color: 'var(--primary-green)' }}>📍 Encontrá este libro más rápido</h4>
                        
                        {!isLoggedIn ? (
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p style={{ margin: 0, flex: 1, fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Ordená las librerías por cercanía usando tu ubicación actual o tus direcciones guardadas.
                                </p>
                                
                                {/* Contenedor de botones apilados */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
                                    <button 
                                        className="login-btn" 
                                        onClick={() => setMostrarModalAuth(true)} 
                                        style={{ padding: '7px 15px', width: '100%', fontWeight: 'bold', fontSize: '10px' }}
                                    >
                                        INICIAR SESIÓN
                                    </button>
                                    <button 
                                        className="search-btn" 
                                        onClick={pedirUbicacion} 
                                        style={{ padding: '7px 15px', width: '100%', fontSize: '10px' }}
                                    >
                                        USAR MI UBICACIÓN
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Seleccioná un punto de referencia para calcular la distancia:
                                </p>
                                <Select 
                                    options={opcionesUbicacion}
                                    value={opcionSeleccionada}
                                    onChange={handleUbicacionChange}
                                    placeholder="Elegí tu ubicación o dirección de entrega..."
                                    isSearchable={false}
                                    menuPosition="fixed"
                                    styles={{
                                        control: (base: any) => ({
                                            ...base,
                                            minHeight: '42px',
                                            borderColor: 'var(--border-color)',
                                            boxShadow: 'none',
                                            '&:hover': { borderColor: 'var(--primary-green)' }
                                        }),
                                        menu: (base: any) => ({ ...base, zIndex: 9999 })
                                    }}
                                />
                            </div>
                        )}
                    </div>

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
                                            const token = document.cookie.includes('csrftoken')
                                            if(token){
                                                addToCart({
                                                    ean: libro.ean,
                                                    titulo: libro.titulo,
                                                    precio: Number(tienda.precio), 
                                                    libreria: tienda.libreria
                                                });
                                            mostrarToast(libro.titulo);
                                            } else {
                                                setMostrarModalAuth(true);
                                            }
                                        }}
                                    >
                                        Añadir a la compra
                                    </button>
                                    {mostrarModalAuth && (
                                        <AuthModal 
                                            onClose={() => setMostrarModalAuth(false)} 
                                            onLoginSuccess={() => {
                                                window.location.reload(); 
                                            }}
                                        />
                                    )}
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