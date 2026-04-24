import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartSidebar = () => {
    const { cartOpen, setCartOpen, cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();

    const groupedCart = cartItems.reduce((grupos, item) => {
        if (!grupos[item.libreria]) {
            grupos[item.libreria] = [];
        }
        grupos[item.libreria].push(item);
        return grupos;
    }, {} as Record<string, typeof cartItems>);

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
    };

    const [toast, setToast] = useState({ visible: false, mensaje: '' });

    const mostrarToastEliminado = (tituloLibro: string) => {
        setToast({ visible: true, mensaje: `🗑️ "${tituloLibro}" eliminado del carrito` });
        
        setTimeout(() => {
            setToast({ visible: false, mensaje: '' });
        }, 3000);
    };

    return (
        <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`} id="cart-sidebar">
            <div className="cart-header">
                <h2>Mi Selección ({cartItems.length})</h2>
                <button className="close-btn" onClick={() => setCartOpen(false)}>Cerrar</button>
            </div>
            
            <p className="cart-notice">La facturación y el pago se procesan de forma segura en la plataforma individual de cada librería.</p>
            
            <div id="cart-content">
                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-white)', borderRadius: '4px' }}>
                    <h2>Tu carrito está vacío</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>¡Buscá los libros que tenés ganas de leer!</p>
                    <button 
                        className="btn-add-cart" 
                        style={{ width: 'auto', padding: '10px 20px' }}
                        onClick={() => {
                            navigate('/');
                            setCartOpen(false);
                        }}
                    >
                        IR A BUSCAR LIBROS
                    </button>
                </div>
                ) : (
                    Object.entries(groupedCart).map(([libreria, items]) => {
                        const subtotal = items.reduce((sum, item) => sum + item.precio, 0);

                        return (
                            <div className="cart-group" key={libreria} style={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>
                                    Vendedor: {libreria}
                                </h4>
                                
                                {items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                                        
                                        <span style={{ paddingRight: '10px' }}>{item.titulo}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                                            <span>{formatearPrecio(item.precio)}</span>
                                            
                                            <button className="remove-btn" 
                                                onClick={() => {
                                                    removeFromCart(item);
                                                    mostrarToastEliminado(item.titulo);
                                                }}
                                                title="Eliminar del carrito">
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        width="16"
                                                        height="16" 
                                                        viewBox="0 0 24 24" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                            </button>
                                        </div>

                                    </div>
                                ))}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px dotted #CCC', fontWeight: 'bold' }}>
                                    <span>Subtotal</span>
                                    <span>{formatearPrecio(subtotal)}</span>
                                </div>
                                
                                <button 
                                    className="search-btn" 
                                    style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: 'var(--accent-bordeaux)', color: 'white' }}
                                    onClick={() => {
                                        const eanBusqueda = items[0].ean; 
                                        const dominioLibreria = "mitiendanube.com"; 
                                        const urlDestino = `https://${dominioLibreria}/search/?q=${eanBusqueda}`;
                                        window.open(urlDestino, '_blank');
                                    }}
                                >
                                    Ir a pagar a {libreria}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
            <div className={`toast-notification ${toast.visible ? 'show' : ''}`}>
                {toast.mensaje}
            </div>
        </div>
        
    );
};