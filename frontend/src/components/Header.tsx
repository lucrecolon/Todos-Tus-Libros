import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import logo from '../assets/IMG_4561.png';

export const Header = () => {
    const { cartItems, setCartOpen } = useCart();
    const navigate = useNavigate();
    const { wishlist } = useWishlist();

    return (
        <header>
            <div 
                className="logo"
                onClick={() => { navigate('/'); setCartOpen(false); }} 
                style={{ cursor: 'pointer' }}
            >
                <img src={logo} alt="Todos Tus Libros" />
            </div>

            <div className="header-actions">
                <button className="favorites-btn" onClick={() => { navigate('/favoritos'); setCartOpen(false); }}> 
                    <i className="bi bi-suit-heart"></i> 
                    <span className="btn-text">FAVORITOS ({wishlist.length})</span>
                </button>

                <button className="cart-btn" onClick={() => setCartOpen(true)}>
                    <i className="bi bi-cart3"></i>
                    <span className="btn-text">CARRITO ({cartItems.length})</span>
                </button>

                <button className="user-btn" onClick={() => { navigate('/user/me'); setCartOpen(false); }}>
                    <i className="bi bi-person-square"></i>
                    <span className="btn-text">PERFIL</span>
                </button>
            </div>

        </header>
    );
};