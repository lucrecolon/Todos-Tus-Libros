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

    const badgeStyle = {
        position: 'absolute' as 'absolute',
        top: '-6px',
        right: '-10px',
        backgroundColor: 'var(--accent-bordeaux, #8B0000)',
        color: 'white',
        borderRadius: '50%',
        fontSize: '11px',
        minWidth: '16px',
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        padding: '0px'
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
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                        <i className="bi bi-suit-heart"></i>
                        <span style={badgeStyle}>{wishlist.length}</span>
                    </span>
                    <span className="btn-text" style={{ marginLeft: '6px' }}>FAVORITOS</span>
                </button>

                <button className="cart-btn" onClick={handleClickCarrito}>
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                        <i className="bi bi-cart3"></i>
                        <span style={badgeStyle}>{cartItems.length}</span>
                    </span>
                    <span className="btn-text" style={{ marginLeft: '6px' }}>CARRITO</span>
                </button>

                <button className="user-btn" onClick={() => { handleClickPerfil(); setCartOpen(false); }}>
                    <i className="bi bi-person-square"></i>
                    <span className="btn-text" style={{ marginLeft: '6px' }}>PERFIL</span>
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