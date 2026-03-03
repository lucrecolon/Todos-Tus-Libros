import { useCart } from '../context/CartContext';

export const Header = () => {
    const { cartCount, setCartOpen } = useCart();

    return (
        <header>
            <div className="logo">Todos Tus Libros Argentina</div>
            {/* al hacer clic, se abre el carrito */}
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
                Mi Carrito ({cartCount})
            </button>
        </header>
    );
};