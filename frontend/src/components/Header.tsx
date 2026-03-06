import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
    const { cartItems, setCartOpen } = useCart();
    const navigate = useNavigate();

    return (
        <header>
            <div 
                className="logo" 
                onClick={() => navigate('/')} 
                style={{ cursor: 'pointer' }}
            >
                TODOS TUS LIBROS ARGENTINA
            </div>
            
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
                MI CARRITO ({cartItems.length})
            </button>
        </header>
    );
};