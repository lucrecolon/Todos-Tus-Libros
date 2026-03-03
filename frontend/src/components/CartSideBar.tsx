import { useCart } from '../context/CartContext';

export const CartSidebar = () => {
    const { cartOpen, setCartOpen, cartCount } = useCart();

    return (
        <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`} id="cart-sidebar">
            <div className="cart-header">
                <h2>Mi Selección ({cartCount})</h2>
                {/* Botón para cerrar */}
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
    );
};