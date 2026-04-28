import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfilUsuario } from '../services/ultraService';

export const User = () => {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const datos = await obtenerPerfilUsuario();
                setPerfil(datos);
            } catch (error) {
                console.error("Error cargando el perfil", error);
                
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [navigate]);

    if (cargando) return <h2 style={{ padding: '40px', textAlign: 'center' }}>Cargando tu perfil...</h2>;
    if (!perfil) return <h2 style={{ padding: '40px', textAlign: 'center' }}>No se pudo cargar la información.</h2>;

    return (
        <div className="main-container profile-container">
            <div className="profile-header">
                <h2 className="results-header" style={{ margin: 0, border: 'none' }}>Mi Cuenta</h2>
                <button 
                    className="search-btn" 
                    style={{ padding: '8px 20px', width: 'auto' }}
                    onClick={() => {
                        //cerrar sesion: borrar token y redirigir
                        localStorage.removeItem('token');
                        navigate('/');
                    }}
                >
                    CERRAR SESIÓN
                </button>
            </div>

            <div className="profile-content">
                <section className="profile-section">
                    <h3 className="profile-section-title">Datos Personales</h3>
                    <div className="profile-card info-card">
                        <div className="info-group">
                            <span className="info-label">Nombre completo</span>
                            <span className="info-value" style={{ textTransform: 'capitalize' }}>
                                {perfil.first_name} {perfil.last_name}
                            </span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Email</span>
                            <span className="info-value">{perfil.email}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Fecha de nacimiento</span>
                            <span className="info-value">{perfil.birth_date || 'No especificada'}</span>
                        </div>
                    </div>
                </section>

                <section className="profile-section">
                    <h3 className="profile-section-title">Mis Direcciones</h3>
                    
                    {perfil.user_addresses && perfil.user_addresses.length > 0 ? (
                        <div className="addresses-grid">
                            {perfil.user_addresses.map((dir: any, index: number) => (
                                <div key={index} className="profile-card address-card">
                                    {dir.main && <span className="main-badge">Principal</span>}
                                    
                                    <p className="address-street">
                                        {dir.street} {dir.number} {dir.door ? ` - Dpto: ${dir.door}` : ''}
                                    </p>
                                    <p className="address-detail">
                                        {dir.city?.name}, {dir.state?.name}
                                    </p>
                                    <p className="address-detail">
                                        CP: {dir.postal_code} | {dir.country?.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-prompt" style={{ textAlign: 'left', padding: '20px' }}>
                            <p>Aún no tenés direcciones guardadas en tu cuenta.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
