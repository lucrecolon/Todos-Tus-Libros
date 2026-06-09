import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfilUsuario, logoutUsuario, inicializarCSRF, agregarDireccion, obtenerPaises, obtenerProvincias, obtenerCiudades, modificarDireccion, eliminarDireccion } from '../services/ultraService';
import { useCart } from '../context/CartContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { modificarPerfil } from '../services/ultraService';

export const User = () => {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [datosPerfil, setDatosPerfil] = useState({
        first_name: '',
        last_name: '',
        birth_date: ''
    });

    const [paises, setPaises] = useState<any[]>([]);
    const [provincias, setProvincias] = useState<any[]>([]);
    const [ciudades, setCiudades] = useState<any[]>([]);

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const [direccionAEliminar, setDireccionAEliminar] = useState<any | null>(null);

    const [mostrarToast, setMostrarToast] = useState(false);
    const [toastMensaje, setToastMensaje] = useState("");

    const { clearCart } = useCart();
    
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [nuevaDireccion, setNuevaDireccion] = useState<{
        id?: number;
        street: string;
        number: string;
        door: string;
        postal_code: string;
        main: boolean;
        country_id: string;
        state_id: string;
        city_id: string;
    }>({
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
            const payloadDireccion = {
                ...nuevaDireccion,
                city: null,
                state: null,
                country: null
            };

            if (nuevaDireccion.id) {
                await modificarDireccion(nuevaDireccion.id, payloadDireccion);
            } else {
                await agregarDireccion(payloadDireccion);
            }
            
            const datosActualizados = await obtenerPerfilUsuario();
            setPerfil(datosActualizados);
            
            setMostrandoFormulario(false);
            setNuevaDireccion({ 
                street: '', 
                number: '', 
                door: '', 
                postal_code: '', 
                main: false, 
                country_id: '', 
                state_id: '', 
                city_id: '' 
            });
            
        } catch (error) {
            console.error("Error al procesar la dirección:", error);
            alert('Hubo un problema al guardar la dirección. Revisá la consola.');
        }
    };

    const handleGuardarPerfil = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hayCambios) return;

        try {
            await modificarPerfil(datosPerfil);
            
            const datosActualizados = await obtenerPerfilUsuario();
            setPerfil(datosActualizados);
            
            setEditandoPerfil(false);
            mostrarNotificacion("Datos personales actualizados correctamente.");
        } catch (error) {
            alert("Hubo un problema al actualizar tus datos.");
        }
    };

    const mostrarNotificacion = (mensaje: string) => {
        setToastMensaje(mensaje);
        setMostrarToast(true);
        setTimeout(() => setMostrarToast(false), 3000);
    };

    const prepararEdicion = async (dir: any) => {
        if (dir.country?.id) {
            const provinciasData = await obtenerProvincias(Number(dir.country.id));
            setProvincias(provinciasData);
        }

        if (dir.state?.id) {
            const ciudadesData = await obtenerCiudades(Number(dir.state.id));
            setCiudades(ciudadesData);
        }

        setNuevaDireccion({
            id: dir.id,
            street: dir.street,
            number: dir.number,
            door: dir.door || '',
            postal_code: dir.postal_code,
            main: dir.main,
            country_id: dir.country?.id || '',
            state_id: dir.state?.id || '',
            city_id: dir.city?.id || ''
        });
        
        setMostrandoFormulario(true);
    };

    if (cargando) return <h2 style={{ padding: '40px', textAlign: 'center' }}>Cargando tu perfil...</h2>;
    if (!perfil) return <h2 style={{ padding: '40px', textAlign: 'center' }}>No se pudo cargar la información.</h2>;

    const hayCambios = 
        datosPerfil.first_name !== (perfil.first_name || '') ||
        datosPerfil.last_name !== (perfil.last_name || '') ||
        datosPerfil.birth_date !== (perfil.birth_date || '');

    const existePrincipal = perfil.user_addresses?.some((dir: any) => dir.main);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="book-title">Mi Cuenta</h1>
                <button 
                    className="logout-btn"
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                        setMostrarConfirmacion(true);
                    }}
                >
                    CERRAR SESIÓN
                </button>
            </div>

            <div className="profile-content" style={{ width: '100%' }}>
                <section className="profile-section" style={{ marginBottom: '50px' }}>
                    <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="profile-section-title" style={{ margin: 0 }}>Datos Personales</h2>
                        
                        {!editandoPerfil && (
                            <button 
                                style={{ 
                                    color: 'var(--accent-bordeaux)', 
                                    background: 'transparent', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}
                                onClick={() => {
                                    setDatosPerfil({
                                        first_name: perfil.first_name || '',
                                        last_name: perfil.last_name || '',
                                        birth_date: perfil.birth_date || ''
                                    });
                                    setEditandoPerfil(true);
                                }}
                            >
                                <i className="bi bi-pencil-square" style={{ marginRight: '5px' }}></i> EDITAR
                            </button>
                        )}
                    </div>

                    {editandoPerfil ? (
                        <form onSubmit={handleGuardarPerfil} className="profile-card" style={{ padding: '20px', marginTop: '15px', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Nombre</label>
                                    <input 
                                        type="text" 
                                        className="search-input" 
                                        value={datosPerfil.first_name} 
                                        onChange={(e) => setDatosPerfil({...datosPerfil, first_name: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Apellido</label>
                                    <input 
                                        type="text" 
                                        className="search-input" 
                                        value={datosPerfil.last_name} 
                                        onChange={(e) => setDatosPerfil({...datosPerfil, last_name: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Fecha de Nacimiento</label>
                                <input 
                                    type="date" 
                                    className="search-input" 
                                    value={datosPerfil.birth_date} 
                                    onChange={(e) => setDatosPerfil({...datosPerfil, birth_date: e.target.value})} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setEditandoPerfil(false)} 
                                    style={{ padding: '8px 15px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="search-btn" 
                                    disabled={!hayCambios}
                                    style={{ 
                                        padding: '8px 15px', 
                                        width: 'auto',
                                        opacity: hayCambios ? 1 : 0.5,
                                        cursor: hayCambios ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="info-card" style={{ marginTop: '15px' }}>
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
                    )}
                </section>

                <section className="profile-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                        <h3 className="profile-section-title" style={{ margin: 0, color: 'var(--text-dark)' }}>Mis Direcciones</h3>
                        <button 
                            className="btn-add" 
                            onClick={() => setMostrandoFormulario(!mostrandoFormulario)}
                        >
                            {mostrandoFormulario ? 'CANCELAR' : '+ AGREGAR'}
                        </button>
                    </div>

                    {mostrandoFormulario && (
                        <div className="profile-card" style={{ marginBottom: '30px', padding: '30px', background: 'var(--bg-white)', border: '1px solid var(--accent-bordeaux)', borderRadius: '4px' }}>
                            <form onSubmit={handleCrearDireccion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h4>{nuevaDireccion.id ? 'Editar dirección' : 'Nueva dirección de entrega'}</h4>
                                
                                <input 
                                    className="search-input"
                                    type="text" 
                                    placeholder="Calle" 
                                    required
                                    minLength={3}
                                    maxLength={100}
                                    pattern="[A-Za-zÀ-ÿ0-9\s\.\-]+"
                                    title="Ingresá un nombre de calle válido (mínimo 3 letras)"
                                    value={nuevaDireccion.street}
                                    onChange={(e) => setNuevaDireccion({...nuevaDireccion, street: e.target.value})}
                                />
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        className="search-input"
                                        type="text" 
                                        placeholder="Número" 
                                        required
                                        maxLength={6}
                                        pattern="[0-9]+"
                                        title="Ingresá solo números para la altura"
                                        value={nuevaDireccion.number}
                                        onChange={(e) => setNuevaDireccion({...nuevaDireccion, number: e.target.value.replace(/[^0-9]/g, '')})}
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
                                    minLength={4}
                                    maxLength={8}
                                    pattern="[A-Za-z0-9]+"
                                    title="Ingresá un código postal válido sin espacios"
                                    value={nuevaDireccion.postal_code}
                                    onChange={(e) => setNuevaDireccion({...nuevaDireccion, postal_code: e.target.value.trim()})}
                                />
                                
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#596a7b', marginTop: '5px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={nuevaDireccion.main}
                                        onChange={(e) => setNuevaDireccion({...nuevaDireccion, main: e.target.checked})}
                                    />
                                    Definir como dirección principal
                                </label>

                                {nuevaDireccion.main && existePrincipal && (
                                    <div style={{ 
                                        color: '#c53030', 
                                        backgroundColor: '#fde8e8', 
                                        padding: '10px', 
                                        borderRadius: '4px', 
                                        fontSize: '13px', 
                                        marginTop: '5px', 
                                        border: '1px solid #f8b4b4' 
                                    }}>
                                        ⚠️ Ya tenés una dirección principal. Si continuás, la anterior pasará a ser secundaria.
                                    </div>
                                )}
                                
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
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                        <button 
                                            style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                            onClick={() => prepararEdicion(dir)}
                                        >
                                            <i className="bi bi-pencil"></i> Editar
                                        </button>
                                        <button 
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-bordeaux)', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                            onClick={() => setDireccionAEliminar(dir)}
                                        >
                                            <i className="bi bi-trash"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-prompt" style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Aún no tenés direcciones guardadas en tu cuenta.</p>
                        </div>
                    )}

                    {mostrarConfirmacion && (
                        <ConfirmModal 
                            titulo="Cerrar sesión"
                            mensaje="¿Estás seguro de que querés cerrar tu sesión?"
                            textoConfirmar="Salir"
                            onCancel={() => setMostrarConfirmacion(false)}
                            onConfirm={async () => {
                                await logoutUsuario(); 
                                localStorage.removeItem('token');
                                document.cookie = 'csrftoken=; Max-Age=0; path=/;';
                                clearCart(); 
                                window.location.href = '/';
                            }}
                        />
                    )}
                    <div 
                        className={`toast-notification ${mostrarToast ? 'show' : ''}`}>
                        <i className="bi bi-check-circle-fill" style={{ marginRight: '8px' }}></i>
                        {toastMensaje}
                    </div>
                </section>
            </div>
            {direccionAEliminar && (
                <ConfirmModal 
                    titulo="Eliminar dirección"
                    mensaje={`¿Estás seguro de que querés borrar la dirección "${direccionAEliminar.street} ${direccionAEliminar.number}"? Esta acción no se puede deshacer.`}
                    textoConfirmar="Eliminar"
                    onCancel={() => setDireccionAEliminar(null)}
                    onConfirm={async () => {
                        try {
                            await eliminarDireccion(direccionAEliminar.id);
                            window.location.href = '/user/me';
                        } catch (error) {
                            console.error("Error borrando dirección", error);
                        }
                    }}
                />
            )}
        </div>
    )};