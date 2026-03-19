import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export const Header = () => {
    const { cartItems, setCartOpen } = useCart();
    const navigate = useNavigate();
    const { wishlist } = useWishlist();

    return (
        <header>
            <div 
                className="logo"
                onClick={() => navigate('/')} 
                style={{ cursor: 'pointer' }}
            >
                <img src="\src\assets\TTL_logotemporal.png" alt="Todos Tus Libros" />
            </div>

            <div className="header-actions">
                <button className="favorites-btn" onClick={() => navigate('/favoritos')}
                    > FAVORITOS ({wishlist.length})
                </button>

                <button className="cart-btn" onClick={() => setCartOpen(true)}>
                    MI CARRITO ({cartItems.length})
                </button>

            </div>

        </header>
    );
};