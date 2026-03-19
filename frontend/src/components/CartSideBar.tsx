import { useCart } from '../context/CartContext';

export const CartSidebar = () => {
    const { cartOpen, setCartOpen, cartItems, removeFromCart } = useCart();

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

    return (
        <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`} id="cart-sidebar">
            <div className="cart-header">
                <h2>Mi Selección ({cartItems.length})</h2>
                <button className="close-btn" onClick={() => setCartOpen(false)}>Cerrar</button>
            </div>
            
            <p className="cart-notice">La facturación y el pago se procesan de forma segura en la plataforma individual de cada librería.</p>
            
            <div id="cart-content">
                {cartItems.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', marginTop: '50px', fontSize: '14px' }}>No hay artículos seleccionados.</p>
                ) : (
                    Object.entries(groupedCart).map(([libreria, items]) => {
                        const subtotal = items.reduce((sum, item) => sum + item.precio, 0);

                        return (
                            <div className="cart-group" key={libreria} style={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>
                                    Vendedor: {libreria}
                                </h4>
                                
                                {items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                                        <span>{item.titulo}</span>
                                        <span>{formatearPrecio(item.precio)}</span>
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

                                <button className="remove-btn" 
                                    onClick={() => removeFromCart(items[0])}
                                    title="Eliminar del carrito">Eliminar
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};