import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado, buscarLibroPorEan } from '../services/ultraService'; 
import { useCart } from '../context/CartContext';

export const BookSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const queryTitulo = searchParams.get('titulo') || ''; 
    const queryAutor = searchParams.get('autor') || ''; 
    const queryEditorial = searchParams.get('editorial') || ''; 

    const [inputTitulo, setInputTitulo] = useState(queryTitulo);
    const [inputAutor, setInputAutor] = useState(queryAutor);
    const [inputEditorial, setInputEditorial] = useState(queryEditorial);

    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    
    const busquedaActiva = queryTitulo || queryAutor || queryEditorial;

    useEffect(() => {
        const fetchResultados = async () => {
            if (busquedaActiva) {
                setCargando(true);
                const dataBusqueda = await buscarLibrosAvanzado({
                    titulo: queryTitulo,
                    autor: queryAutor,
                    editorial: queryEditorial
                });
                
                const librosConDetalle = await Promise.all(
                    dataBusqueda.map(async (libroBasico: any) => {
                        try { return await buscarLibroPorEan(libroBasico.ean); } 
                        catch { return libroBasico; }
                    })
                );
                
                const listadoAplanado = librosConDetalle.flatMap(libro => 
                    (libro.en_librerias || [])
                        .filter((tienda: any) => tienda.libreria !== 'Rit - test' && Number(tienda.precio) > 0)
                        .map((tienda: any) => ({
                            ...libro, 
                            precio_tienda: tienda.precio,
                            nombre_libreria: tienda.libreria,
                            stock_tienda: tienda.stock
                        }))
                );
                
                setPublicaciones(listadoAplanado);
                setCargando(false);
            } else {
                setPublicaciones([]);
            }
        };

        fetchResultados();
    }, [queryTitulo, queryAutor, queryEditorial]);

    const aplicarFiltros = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nuevosParametros = new URLSearchParams();
        if (inputTitulo) nuevosParametros.set('titulo', inputTitulo);
        if (inputAutor) nuevosParametros.set('autor', inputAutor);
        if (inputEditorial) nuevosParametros.set('editorial', inputEditorial);
        setSearchParams(nuevosParametros); 
    };

    const formatearPrecio = (precio: number | string) => {
        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(numero);
    };

    return (
        <div className="main-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', flexDirection: 'column' }}>
            
            {/* BARRA DE BUSQUEDA */}
            <div style={{ backgroundColor: 'var(--bg-white)', padding: '20px', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <form onSubmit={aplicarFiltros} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Título / ISBN</label>
                        <input type="text" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} placeholder="Ej: Rayuela" style={{ width: '100%', padding: '10px', border: '1px solid #CCC', borderRadius: '4px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Autor (Apellido)</label>
                        <input type="text" value={inputAutor} onChange={(e) => setInputAutor(e.target.value)} placeholder="Ej: Cortazar" style={{ width: '100%', padding: '10px', border: '1px solid #CCC', borderRadius: '4px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Editorial</label>
                        <input type="text" value={inputEditorial} onChange={(e) => setInputEditorial(e.target.value)} placeholder="Ej: Sudamericana" style={{ width: '100%', padding: '10px', border: '1px solid #CCC', borderRadius: '4px' }} />
                    </div>
                    <button type="submit" className="search-btn" style={{ padding: '11px 25px', backgroundColor: 'var(--accent-bordeaux)' }}>
                        BUSCAR
                    </button>
                </form>
            </div>

            {/* RESULTADOS */}
            <div>
                <h2 style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>Resultados de Búsqueda</h2>
                
                {!busquedaActiva ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-paper)', border: '1px dashed #CCC' }}>
                        <p>Ingresá los datos en la barra superior para comenzar tu búsqueda.</p>
                    </div>
                ) : cargando ? (
                    <p>Conectando con la red de librerías...</p>
                ) : publicaciones.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-paper)', border: '1px solid #fee' }}>
                        <p style={{ color: '#c0392b', fontWeight: 'bold' }}>No se encontraron libros para esta búsqueda.</p>
                        <p style={{ fontSize: '14px' }}>Verificá que el apellido del autor esté correcto o intentá con menos filtros.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {publicaciones.map((pub, index) => (
                            <div key={`${pub.ean}-${pub.nombre_libreria}-${index}`} style={{ display: 'flex', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', padding: '20px', gap: '25px' }}>

                                <div style={{ width: '120px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate(`/libro/${pub.ean}`)}>
                                    {pub.imagen_tapa ? (
                                        <img src={pub.imagen_tapa} alt={pub.titulo} style={{ width: '100%', height: 'auto', objectFit: 'contain', border: '1px solid var(--border-color)' }} />
                                    ) : (
                                        <div className="book-cover-mock" style={{ height: '180px' }}>Sin portada</div>
                                    )}
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', cursor: 'pointer' }} onClick={() => navigate(`/libro/${pub.ean}`)}>{pub.titulo}</h3>
                                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontStyle: 'italic' }}>Por {pub.autor ? `${pub.autor.nombre} ${pub.autor.apellido}` : 'Autor no especificado'}</p>
                                    <div style={{ backgroundColor: 'var(--bg-paper)', padding: '10px', borderRadius: '4px', width: 'fit-content' }}>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--primary-green)', fontWeight: 'bold' }}>Vendido por: {pub.nombre_libreria}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#27ae60' }}>Stock: {pub.stock_tienda} unidades</p>
                                    </div>
                                </div>

                                <div style={{ width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
                                    <div style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginBottom: '15px' }}>{formatearPrecio(pub.precio_tienda)}</div>
                                    <button 
                                        className="search-btn"
                                        style={{ backgroundColor: 'var(--accent-bordeaux)', width: '100%', padding: '12px', fontSize: '13px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart({ ean: pub.ean, titulo: pub.titulo, precio: Number(pub.precio_tienda), libreria: pub.nombre_libreria });
                                        }}
                                    >
                                        AGREGAR AL CARRITO
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};