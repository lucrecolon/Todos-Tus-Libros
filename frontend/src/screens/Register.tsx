import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actualizarPerfilUsuario, loginUsuario, registrarUsuarioBase } from '../services/ultraService';

export const Register = () => {
    const navigate = useNavigate();
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando] = useState(false);

    const handleRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            await registrarUsuarioBase(email, password);
            console.log('¡Usuario base creado con éxito!');

            await loginUsuario(email, password);
            console.log('¡Sesión iniciada automáticamente!');

            const datosPendientes = {
                first_name: firstName,
                last_name: lastName,
                birth_date: birthDate
            };
            
            await actualizarPerfilUsuario(datosPendientes);
            console.log('¡Perfil completo actualizado!');

            navigate('/user/me'); 

        } catch (error) {
            console.error("Hubo un error en el proceso:", error);
        }
    };

    return (
        <div className="main-container register-container">
            <form onSubmit={handleRegistro} className="search-box register-form">
                
                <h2 className="register-title">Sign In</h2>
                <p className="register-subtitle">
                    Anotate hoy y recibí un beneficio exclusivo para tu primera compra.
                </p>

                <div className="register-group">
                    <label className="register-label">Nombre</label>
                    <input 
                        type="text" 
                        required
                        className="search-input" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="Tu nombre"
                    />
                </div>

                <div className="register-group">
                    <label className="register-label">Apellido</label>
                    <input 
                        type="text" 
                        required
                        className="search-input" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Tu apellido"
                    />
                </div>

                <div className="register-group">
                    <label className="register-label">Fecha de Nacimiento</label>
                    <input 
                        type="date" 
                        required
                        className="search-input" 
                        value={birthDate} 
                        onChange={(e) => setBirthDate(e.target.value)} 
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
                        placeholder="La contraseña debe ser alfanumérica y debe tener al menos 8 caracteres"
                    />
                </div>

                <button type="submit" className="search-btn" style={{ width: '100%' }} disabled={cargando}>
                    {cargando ? 'CREANDO CUENTA...' : 'CREAR CUENTA Y OBTENER BENEFICIO'}
                </button>
            </form>
        </div>
    );
};