import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { actualizarPerfilUsuario, loginUsuario, registrarUsuarioBase } from '../services/ultraService';

export const Register = () => {
    const navigate = useNavigate();
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando] = useState(false);

    const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
    
    const [emailError, setEmailError] = useState('');

    const handleRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEmailError('');
        
        try {
            await registrarUsuarioBase(email, password);
            console.log('¡Usuario creado con éxito!');

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

        } catch (error: any) {
            console.error("Hubo un error en el proceso:", error);
            
            const errorAString = JSON.stringify(error?.response?.data || error) + " " + String(error?.message) + " " + String(error);
            const mensajeError = errorAString.toLowerCase();
            
            if (mensajeError.includes('email') || mensajeError.includes('already exists') || mensajeError.includes('ya existe') || mensajeError.includes('unique')) {
                setEmailError("Este email ya está registrado.");
            } else {
                setEmailError("Hubo un problema al registrarte. Por favor, intentá de nuevo.");
            }
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
                        style={{ borderColor: emailError ? 'var(--accent-bordeaux)' : '' }}
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="tuemail@dominio.com"
                    />
                    {emailError && (
                        <span style={{ color: 'var(--accent-bordeaux)', fontSize: '0.85rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                            {emailError}
                        </span>
                    )}
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                    <input 
                        type="checkbox" 
                        id="politicas" 
                        checked={aceptaPoliticas}
                        onChange={(e) => setAceptaPoliticas(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="politicas" style={{ fontSize: '0.95rem', color: 'var(--text-dark)', cursor: 'pointer', margin: 0 }}>
                        Acepto las <Link to="/privacidad" target="_blank" style={{ color: 'var(--primary-green)', textDecoration: 'underline' }}>Políticas de Privacidad</Link>
                    </label>
                </div>

                <button type="submit" disabled={!aceptaPoliticas || cargando} className="search-btn" style={{ opacity: aceptaPoliticas ? 1 : 0.5, cursor: aceptaPoliticas ? 'pointer' : 'not-allowed',width: '100%'}}>
                    {cargando ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
                </button>
            </form>
        </div>
    );
};