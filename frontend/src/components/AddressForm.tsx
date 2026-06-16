import Select from 'react-select';

interface AddressFormProps {
    nuevaDireccion: any;
    setNuevaDireccion: (dir: any) => void;
    paises: any[];
    provincias: any[];
    ciudades: any[];
    cambiarPais: (id: string) => void;
    cambiarProvincia: (id: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    existePrincipal: boolean;
}

export const AddressForm = ({
    nuevaDireccion,
    setNuevaDireccion,
    paises,
    provincias,
    ciudades,
    cambiarPais,
    cambiarProvincia,
    onSubmit,
    onCancel,
    existePrincipal
}: AddressFormProps) => {

    const opcionesPaises = paises.map(p => ({ value: p.id.toString(), label: p.name }));
    const opcionesProvincias = provincias.map(p => ({ value: p.id.toString(), label: p.name }));
    const opcionesCiudades = ciudades.map(c => ({ value: c.id.toString(), label: c.name }));

    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            minHeight: '40px',
            borderColor: 'var(--border-color, #ccc)',
            borderRadius: '4px',
            boxShadow: 'none',
            '&:hover': { borderColor: 'var(--primary-green, #198754)' }
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 9999
        })
    };

    return (
        <div className="profile-card" style={{ marginBottom: '30px', padding: '30px', background: 'var(--bg-white)', border: '1px solid var(--accent-bordeaux)', borderRadius: '4px' }}>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{nuevaDireccion.id ? 'Editar dirección' : 'Nueva dirección de entrega'}</h4>
                    <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
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

                <div style={{ marginBottom: '5px' }}>
                    <Select 
                        options={opcionesPaises}
                        value={opcionesPaises.find(opt => opt.value === nuevaDireccion.country_id) || null}
                        onChange={(option) => option && cambiarPais(option.value)}
                        placeholder="Seleccioná un país..."
                        isSearchable
                        menuPosition="fixed"
                        styles={customSelectStyles}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                    <div style={{ flex: 1 }}>
                        <Select 
                            options={opcionesProvincias}
                            isDisabled={!nuevaDireccion.country_id}
                            value={opcionesProvincias.find(opt => opt.value === nuevaDireccion.state_id) || null}
                            onChange={(option) => option && cambiarProvincia(option.value)}
                            placeholder="Provincia / Estado..."
                            isSearchable
                            menuPosition="fixed"
                            styles={customSelectStyles}
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <Select 
                            options={opcionesCiudades}
                            isDisabled={!nuevaDireccion.state_id}
                            value={opcionesCiudades.find(opt => opt.value === nuevaDireccion.city_id) || null}
                            onChange={(option) => option && setNuevaDireccion({...nuevaDireccion, city_id: option.value})}
                            placeholder="Ciudad / Localidad..."
                            isSearchable
                            menuPosition="fixed"
                            styles={customSelectStyles}
                        />
                    </div>
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
                    <div style={{ color: '#c53030', backgroundColor: '#fde8e8', padding: '10px', borderRadius: '4px', fontSize: '13px', marginTop: '5px', border: '1px solid #f8b4b4' }}>
                        ⚠️ Ya tenés una dirección principal. Si continuás, la anterior pasará a ser secundaria.
                    </div>
                )}
                
                <button type="submit" className="search-btn" style={{ marginTop: '10px' }}>
                    GUARDAR DIRECCIÓN
                </button>
            </form>
        </div>
    );
};