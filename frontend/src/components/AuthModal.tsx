import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/ultraService'; 

interface AuthModalProps {
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export const AuthModal = ({ onClose, onLoginSuccess }: AuthModalProps) => {
    const navigate = useNavigate();
    
    const [vistaModal, setVistaModal] = useState<'opciones' | 'login'>('opciones');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginCargando, setLoginCargando] = useState(false);

    const [errorMensaje, setErrorMensaje] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginCargando(true);
        setErrorMensaje('');
        try {
            const data = await loginUsuario(loginEmail, loginPassword);
            localStorage.setItem('token', data.token);

            if (onLoginSuccess) onLoginSuccess();
            onClose();
            
            window.location.href = '/user/me';
        } catch (error) {
            console.error("Error iniciando sesión:", error);
            setErrorMensaje("Email o contraseña incorrectos. Revisá tus datos e intentá de nuevo.");
        } finally {
            setLoginCargando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <button className="close-modal-btn" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>

                {vistaModal === 'opciones' ? (
                    <div className="auth-prompt">
                        <h3 style={{ marginTop: 0, color: 'var(--text-dark)', fontFamily: 'Georgia, serif' }}>¡Hola!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '25px', textTransform: 'none' }}>
                            Para acceder a tu perfil y ver tu carrito, necesitás ingresar a tu cuenta.
                        </p>
                        <div>
                            <button 
                                className="login-btn" 
                                onClick={() => setVistaModal('login')}
                            >
                                INICIAR SESIÓN
                            </button>

                            <div style={{ padding: '1px', color: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}> </div>

                            <button 
                                className="register-btn" 
                                
                                onClick={() => {
                                    onClose();
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
                        
                        {errorMensaje && (
                            <div style={{ 
                                backgroundColor: '#fde8e8', 
                                color: '#c53030', 
                                padding: '12px', 
                                borderRadius: '4px', 
                                fontSize: '13px', 
                                marginBottom: '20px', 
                                border: '1px solid #f8b4b4',
                                lineHeight: '1.4',
                                textAlign: 'left'
                            }}>
                                ⚠️ {errorMensaje}
                            </div>
                        )}

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
                            onClick={() => {
                                setVistaModal('opciones');
                                setErrorMensaje('');
                            }}
                        >
                            Volver atrás
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};