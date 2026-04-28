import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import logo from '../assets/IMG_4561.png';
import { loginUsuario } from '../services/ultraService';
import { useState } from 'react';

export const Header = () => {
    const { cartItems, setCartOpen } = useCart();
    const navigate = useNavigate();
    const { wishlist } = useWishlist();

    const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
    const [vistaModal, setVistaModal] = useState<'opciones' | 'login'>('opciones');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginCargando, setLoginCargando] = useState(false);

    const handleClickPerfil = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/user');
        } else {
            setVistaModal('opciones');
            setMostrarModalAuth(true);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginCargando(true);
        try {
            const data = await loginUsuario(loginEmail, loginPassword);
            //ajustar "data.token" segun el JSON real
            localStorage.setItem('token', data.token); 
            
            setMostrarModalAuth(false);
            navigate('/user');
        } catch (error) {
            alert('Error al iniciar sesión. Revisá tus datos.');
        } finally {
            setLoginCargando(false);
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

                <button className="cart-btn" onClick={() => setCartOpen(true)}>
                    <i className="bi bi-cart3"></i>
                    <span className="btn-text">CARRITO ({cartItems.length})</span>
                </button>

                <button className="user-btn" onClick={() => { handleClickPerfil(); setCartOpen(false); }}>
                    <i className="bi bi-person-square"></i>
                    <span className="btn-text">PERFIL</span>
                </button>

                {mostrarModalAuth && (
                <div className="modal-overlay" onClick={() => setMostrarModalAuth(false)}>
                    
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <button className="close-modal-btn" onClick={() => setMostrarModalAuth(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>

                        {vistaModal === 'opciones' ? (
                            <div className="auth-prompt">
                                <h3 style={{ marginTop: 0, color: 'var(--text-dark)', fontFamily: 'Georgia, serif' }}>¡Hola!</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
                                    Para acceder a tu perfil y ver tus datos, necesitás ingresar a tu cuenta.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button 
                                        className="search-btn" 
                                        style={{ width: '100%', padding: '12px' }}
                                        onClick={() => setVistaModal('login')}
                                    >
                                        INICIAR SESIÓN
                                    </button>
                                    <button 
                                        className="user-btn" 
                                        style={{ width: '100%', padding: '12px', color: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}
                                        onClick={() => {
                                            setMostrarModalAuth(false);
                                            navigate('/registro');
                                        }}
                                    >
                                        REGISTRARME
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form className="auth-login-form" onSubmit={handleLoginSubmit}>
                                <h3 style={{ marginTop: 0, color: 'var(--text-dark)', fontFamily: 'Georgia, serif' }}>Iniciar Sesión</h3>
                                
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={{ color: 'var(--text-dark)' }}>Email</label>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        required
                                        value={loginEmail} 
                                        onChange={(e) => setLoginEmail(e.target.value)} 
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '25px' }}>
                                    <label className="form-label" style={{ color: 'var(--text-dark)' }}>Contraseña</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        required
                                        value={loginPassword} 
                                        onChange={(e) => setLoginPassword(e.target.value)} 
                                    />
                                </div>

                                <button type="submit" className="search-btn" style={{ width: '100%', padding: '12px' }} disabled={loginCargando}>
                                    {loginCargando ? 'INGRESANDO...' : 'INGRESAR'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', width: '100%', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => setVistaModal('opciones')}
                                >
                                    Volver atrás
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
            </div>
        </header>
    );
};