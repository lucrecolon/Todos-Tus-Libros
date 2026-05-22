import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfilUsuario, logoutUsuario, inicializarCSRF, agregarDireccion, obtenerPaises, obtenerProvincias, obtenerCiudades } from '../services/ultraService';
import { useCart } from '../context/CartContext';

export const User = () => {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    const [paises, setPaises] = useState<any[]>([]);
    const [provincias, setProvincias] = useState<any[]>([]);
    const [ciudades, setCiudades] = useState<any[]>([]);

    const { clearCart } = useCart();
    
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [nuevaDireccion, setNuevaDireccion] = useState({
        street: '',
        number: '',
        door: '',
        postal_code: '',
        main: false,
        country_id: '',
        state_id: '',
        city_id: ''
    });

    useEffect(() => {
        obtenerPaises().then(setPaises);
    }, []);

    const cambiarPais = async (id: string) => {
        setNuevaDireccion({...nuevaDireccion, country_id: id, state_id: '', city_id: ''});
        const data = await obtenerProvincias(Number(id));
        setProvincias(data);
        setCiudades([]);
    };

    const cambiarProvincia = async (id: string) => {
        setNuevaDireccion({...nuevaDireccion, state_id: id, city_id: ''});
        const data = await obtenerCiudades(Number(id));
        setCiudades(data);
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                await inicializarCSRF(); 
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

    const handleCrearDireccion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await agregarDireccion({
                ...nuevaDireccion,
                city: null,
                state: null,
                country: null
            });
            
            const datosActualizados = await obtenerPerfilUsuario();
            setPerfil(datosActualizados);
            
            setMostrandoFormulario(false);
            setNuevaDireccion({ street: '', number: '', door: '', postal_code: '', main: false, country_id: '', state_id: '', city_id: '' });
            
        } catch (error) {
            alert('Hubo un problema al crear la dirección. Revisá la consola.');
        }
    };

    if (cargando) return <h2 style={{ padding: '40px', textAlign: 'center' }}>Cargando tu perfil...</h2>;
    if (!perfil) return <h2 style={{ padding: '40px', textAlign: 'center' }}>No se pudo cargar la información.</h2>;

    return (
        <div className="main-container" style={{ flexDirection: 'column' }}>
            <div className="profile-header">
                <h1 className="book-title">Mi Cuenta</h1>
                <button 
                    className="logout-btn"
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                        await logoutUsuario(); 
                        localStorage.removeItem('token');
                        //remove csrftoken cookie by setting it expired
                        document.cookie = 'csrftoken=; Max-Age=0; path=/;';
                        clearCart();
                        navigate('/');
                    }}
                >
                    CERRAR SESIÓN
                </button>
            </div>

            <div className="profile-content" style={{ width: '100%' }}>
                <section className="profile-section" style={{ marginBottom: '50px' }}>
                    <h3 className="profile-section-title">Datos Personales</h3>
                    <div className="info-card">
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                        <h3 className="profile-section-title" style={{ margin: 0, color: 'var(--text-dark)' }}>Mis Direcciones</h3>
                        <button 
                            className="btn-add" 
                            onClick={() => setMostrandoFormulario(!mostrandoFormulario)}
                        >
                            {mostrandoFormulario ? 'CANCELAR' : '+ AGREGAR DIRECCIÓN'}
                        </button>
                    </div>

                    {mostrandoFormulario && (
                        <div className="profile-card" style={{ marginBottom: '30px', padding: '30px', background: 'var(--bg-white)', border: '1px solid var(--accent-bordeaux)', borderRadius: '4px' }}>
                            <form onSubmit={handleCrearDireccion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h4 style={{ fontFamily: 'Georgia', margin: '0 0 10px 0', fontSize: '18px' }}>Nueva dirección de entrega</h4>
                                
                                <input 
                                    className="search-input"
                                    type="text" 
                                    placeholder="Calle" 
                                    required
                                    value={nuevaDireccion.street}
                                    onChange={(e) => setNuevaDireccion({...nuevaDireccion, street: e.target.value})}
                                />
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        className="search-input"
                                        type="text" 
                                        placeholder="Número" 
                                        required
                                        value={nuevaDireccion.number}
                                        onChange={(e) => setNuevaDireccion({...nuevaDireccion, number: e.target.value})}
                                        style={{ flex: 1 }}
                                    />
                                    <input 
                                        className="search-input"
                                        type="text" 
                                        placeholder="Depto / Piso (Opcional)" 
                                        value={nuevaDireccion.door}
                                        onChange={(e) => setNuevaDireccion({...nuevaDireccion, door: e.target.value})}
                                        style={{ flex: 1 }}
                                    />
                                </div>

                                <select 
                                    className="search-input"
                                    required
                                    value={nuevaDireccion.country_id} 
                                    onChange={(e) => cambiarPais(e.target.value)}
                                >
                                    <option value="" disabled>Seleccioná un país</option>
                                    {paises.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select 
                                        className="search-input"
                                        required
                                        disabled={!nuevaDireccion.country_id}
                                        value={nuevaDireccion.state_id} 
                                        onChange={(e) => cambiarProvincia(e.target.value)}
                                        style={{ flex: 1 }}
                                    >
                                        <option value="" disabled>Provincia / Estado</option>
                                        {provincias.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>

                                    <select 
                                        className="search-input"
                                        required
                                        disabled={!nuevaDireccion.state_id}
                                        value={nuevaDireccion.city_id} 
                                        onChange={(e) => setNuevaDireccion({...nuevaDireccion, city_id: e.target.value})}
                                        style={{ flex: 1 }}
                                    >
                                        <option value="" disabled>Ciudad / Localidad</option>
                                        {ciudades.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <input 
                                    className="search-input"
                                    type="text" 
                                    placeholder="Código Postal" 
                                    required
                                    value={nuevaDireccion.postal_code}
                                    onChange={(e) => setNuevaDireccion({...nuevaDireccion, postal_code: e.target.value})}
                                />
                                
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#596a7b', marginTop: '5px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={nuevaDireccion.main}
                                        onChange={(e) => setNuevaDireccion({...nuevaDireccion, main: e.target.checked})}
                                    />
                                    Definir como dirección principal
                                </label>
                                
                                <button type="submit" className="search-btn" style={{ marginTop: '10px' }}>
                                    GUARDAR DIRECCIÓN
                                </button>
                            </form>
                        </div>
                    )}

                    {perfil.user_addresses && perfil.user_addresses.length > 0 ? (
                        <div className="addresses-grid">
                            {perfil.user_addresses.map((dir: any, index: number) => (
                                <div key={index} className="address-card">
                                    {dir.main && <span className="main-badge">Principal</span>}
                                    
                                    <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '18px' }}>
                                        {dir.street} {dir.number}
                                    </p>
                                    <p className="address-detail" style={{ color: 'var(--text-muted)', margin: '0 0 5px 0' }}>
                                        {dir.door ? `Depto: ${dir.door} | ` : ''} CP: {dir.postal_code}
                                    </p>
                                    <p className="address-detail" style={{ textTransform: 'capitalize', color: 'var(--primary-green)', fontWeight: '500', margin: 0 }}>
                                        {dir.city?.name || 'Localidad'}, {dir.state?.name || 'Provincia'}, {dir.country?.name || 'País'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-prompt" style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Aún no tenés direcciones guardadas en tu cuenta.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )};