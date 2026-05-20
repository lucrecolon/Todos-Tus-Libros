import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import logo from '../assets/IMG_4561.png';
import { AuthModal } from './AuthModal'; 

export const Header = () => {
    const { cartItems, setCartOpen } = useCart();
    const navigate = useNavigate();
    const { wishlist } = useWishlist();

    const [mostrarModalAuth, setMostrarModalAuth] = useState(false);

    const handleClickPerfil = () => {
        const token = document.cookie.includes('csrftoken') 
        if (token) {
            navigate('/user/me');
        } else {
            setMostrarModalAuth(true);
        }
    };

    const handleClickCarrito = () => {
        const token = document.cookie.includes('csrftoken')
        if (token) {
            setCartOpen(true);
        } else {
            setMostrarModalAuth(true);
        }
    };

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

                <button className="cart-btn" onClick={handleClickCarrito}>
                    <i className="bi bi-cart3"></i>
                    <span className="btn-text">CARRITO ({cartItems.length})</span>
                </button>

                <button className="user-btn" onClick={() => { handleClickPerfil(); setCartOpen(false); }}>
                    <i className="bi bi-person-square"></i>
                    <span className="btn-text">PERFIL</span>
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
        </header>
    );
};