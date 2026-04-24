import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import logo from '../assets/IMG_4561.png';
{/*import profile from '../assets/profile2.png';*/}

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
                <button className="favorites-btn" onClick={() => navigate('/favoritos')}> 
                    FAVORITOS ({wishlist.length})
                </button>

                <button className="cart-btn" onClick={() => setCartOpen(true)}>
                    MI CARRITO ({cartItems.length})
                </button>

                {/*<button className="user-btn" onClick={() => navigate('/user')}>
                    <img src={profile} alt="Perfil" title='Mi perfil'/>
                </button>*/}
            </div>

        </header>
    );
};