import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Register = () => {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registrado, setRegistrado] = useState(false);


    const handleRegistro = (e: React.FormEvent) => {
        e.preventDefault();
        // Acá va la logica para enviar los datos al back
        console.log({ nombre, email, password });
        setRegistrado(true);
    };

    if (registrado) {
        return (
            <div className="main-container register-container">
                <div className="success-box">
                    <h2 className="success-title">¡Ya estás en la lista! 🎉</h2>
                    <p className="success-message">
                        Gracias por registrarte. Te enviamos un mail con tu beneficio exclusivo para usar en tu primera compra.
                    </p>
                    <button className="search-btn" onClick={() => navigate('/')}>
                        VOLVER AL INICIO
                    </button>
                </div>
            </div>
        );
    }

    //Formulario de Registro
    return (
        <div className="main-container register-container">
            <form onSubmit={handleRegistro} className="search-box register-form">
                
                <h2 className="register-title">Sign In</h2>
                <p className="register-subtitle">
                    Anotate hoy y recibí un beneficio exclusivo para tu primera compra.
                </p>

                <div className="register-group">
                    <label className="register-label">Nombre completo</label>
                    <input 
                        type="text" 
                        required
                        className="search-input" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        placeholder="Ej: Juan Pérez"
                    />
                </div>

                <div className="register-group">
                    <label className="register-label">Email</label>
                    <input 
                        type="email" 
                        required
                        className="search-input" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="tuemail@dominio.com"
                    />
                </div>

                <div className="register-group last">
                    <label className="register-label">Contraseña</label>
                    <input 
                        type="password" 
                        required
                        className="search-input" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Mínimo 8 caracteres"
                    />
                </div>

                <button type="submit" className="search-btn" style={{ width: '100%' }}>
                    CREAR CUENTA Y OBTENER BENEFICIO
                </button>
            </form>
        </div>
    );
};