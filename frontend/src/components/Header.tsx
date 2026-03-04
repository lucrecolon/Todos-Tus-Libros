import { useCart } from '../context/CartContext';

export const Header = () => {
    const { cartItems, setCartOpen } = useCart();

    return (
        <header>
            <div className="logo">Todos Tus Libros Argentina</div>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
                Mi Carrito ({cartItems.length})
            </button>
        </header>
    );
};