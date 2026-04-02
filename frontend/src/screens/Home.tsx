import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado, buscarLibroPorEan } from '../services/ultraService';

const formatearAutor = (autor: any): string => {
    if (!autor) return 'Autor desconocido';
    if (typeof autor === 'string') return autor;
    const nombre = autor.nombre || '';
    const apellido = autor.apellido || '';
    if (nombre || apellido) return `${nombre} ${apellido}`.trim();
    return 'Autor desconocido';
};

const formatearEditorial = (editorial: any): string => {
    if (!editorial) return 'No especificada';
    if (typeof editorial === 'string') return editorial;
    if (editorial.nombre) return editorial.nombre;
    return 'No especificada';
};

export const Home = () => {
    const [inputTitulo, setInputTitulo] = useState('');
    const [inputAutor, setInputAutor] = useState('');
    const navigate = useNavigate();
    
    const [novedades, setNovedades] = useState<any[]>([]);
    const [cargandoNovedades, setCargandoNovedades] = useState(true);
    const [indiceCarousel, setIndiceCarousel] = useState(0);

    const ejecutarBusqueda = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputTitulo.trim() && !inputAutor.trim()) return;
        const params = new URLSearchParams();
        if (inputTitulo) params.append('titulo', inputTitulo);
        if (inputAutor) params.append('autor', inputAutor);
        navigate(`/buscar?${params.toString()}`); 
    };

    useEffect(() => {
        const fetchNovedades = async () => {
            setCargandoNovedades(true);
            const fecha = new Date();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            
            try {
                const [pagina1, pagina2] = await Promise.all([
                    buscarLibrosAvanzado({ novedades: `${mes}-${anio}`, page: 1 }),
                    buscarLibrosAvanzado({ novedades: `${mes}-${anio}`, page: 2 })
                ]);
                
                const todosLosResultados = [...(pagina1.results || []), ...(pagina2.results || [])];
                
                if (todosLosResultados.length === 0) return;

                const primerosQuince = todosLosResultados.slice(0, 15);
                
                const librosConDetalle = await Promise.all(
                    primerosQuince.map(async (libroBasico: any) => { 
                        try { 
                            const detalle = await buscarLibroPorEan(libroBasico.ean); 
                            return { ...libroBasico, ...detalle }; 
                        } catch { return libroBasico; }
                    })
                );
                
                setNovedades(librosConDetalle);
            } catch (error) {
                console.error("Error cargando novedades:", error);
            } finally {
                setCargandoNovedades(false);
            }
        };
        fetchNovedades();
    }, []);

    useEffect(() => {
        if (novedades.length <= 3) return;
        const intervalo = setInterval(() => {
            setIndiceCarousel(prev => (prev + 3 >= novedades.length ? 0 : prev + 3));
        }, 4000);
        return () => clearInterval(intervalo);
    }, [novedades.length]);

    const avanzar = () => setIndiceCarousel(prev => (prev + 3 >= novedades.length ? 0 : prev + 3));
    const retroceder = () => setIndiceCarousel(prev => (prev - 3 < 0 ? Math.max(0, novedades.length - 3) : prev - 3));


    return (
        <main>
            <section className="hero-section">
                <h1>Encontrá tu próxima lectura en<br />la librería más cercana</h1>
                <p className="hero-subtitle">Buscá entre miles de títulos combinando datos.</p>
                
                <form onSubmit={ejecutarBusqueda} style={{ display: 'flex', gap: '15px', backgroundColor: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '5px' }}>Título / ISBN</label>
                        <input type="text" value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} placeholder="Ej: Rayuela" style={{ width: '100%', padding: '12px', border: '1px solid #CCC', borderRadius: '4px' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '5px' }}>Autor (Apellido)</label>
                        <input type="text" value={inputAutor} onChange={(e) => setInputAutor(e.target.value)} placeholder="Ej: Cortazar" style={{ width: '100%', padding: '12px', border: '1px solid #CCC', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="search-btn" style={{ height: '43px', padding: '0 30px' }}>Buscar</button>
                    </div>
                </form>
            </section>


            <section className="novedades-section" style={{ marginTop: '40px', marginBottom: '40px' }}>
                <div className="novedades-title">
                    <h2 style={{ margin: 0 }}>Novedades del mes</h2>
                    
                    {!cargandoNovedades && novedades.length > 0 && (
                        <button 
                            onClick={() => navigate('/novedades')} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-dark)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px' }}
                        >
                            VER TODOS
                        </button>
                    )}
                </div>
                
                {cargandoNovedades ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Cargando los últimos lanzamientos...</p>
                ) : novedades.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Aún no hay novedades cargadas para este mes.</p>
                ) : (
                    <div style={{ position: 'relative', width: '100%', padding: '0 50px', boxSizing: 'border-box' }}>
                        
                        <button onClick={retroceder} className="carousel-arrow left">◀</button>

                        <div style={{ overflow: 'hidden', width: '100%', padding: '10px 0 20px 0' }}>
                            <div style={{
                                display: 'flex',
                                transition: 'transform 0.6s ease-in-out',
                                transform: `translateX(-${(indiceCarousel / novedades.length) * 100}%)`,
                                width: `${(novedades.length / 3) * 100}%` 
                            }}>
                                
                                {novedades.map((pub, index) => {
                                    const precioMostrar = pub.en_librerias?.find((l: any) => Number(l.precio) > 0)?.precio;
                                    return (
                                        <div key={`novedad-${pub.ean}-${index}`} style={{ width: `${100 / novedades.length}%`, padding: '0 10px', boxSizing: 'border-box' }}>
                                            
                                            <div className="result-item" style={{ height: '100%', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div className="result-item-top">
                                                    <div className="result-image-wrapper" onClick={() => navigate(`/libro/${pub.ean}`)}>
                                                        {pub.imagen_tapa ? (
                                                            <img src={pub.imagen_tapa} alt={pub.titulo} className="result-image" />
                                                        ) : (
                                                            <div className="book-cover-mock" style={{ height: '135px' }}>Sin portada</div>
                                                        )}
                                                    </div>
                                                    <div className="result-info">
                                                        <h3 className="result-title" onClick={() => navigate(`/libro/${pub.ean}`)}>{pub.titulo}</h3>
                                                        <p className="result-author">Por {formatearAutor(pub.autor)}</p>
                                                        <div className="vendor-badge">
                                                            <p className="vendor-title">Editorial: {formatearEditorial(pub.editorial)}</p>
                                                        </div>
                                                        {precioMostrar && (
                                                            <div className="result-price">${Number(precioMostrar).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button className="btn-add-cart" onClick={() => navigate(`/libro/${pub.ean}`)}>VER DISPONIBILIDAD</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button onClick={avanzar} className="carousel-arrow right">▶</button>
                    </div>
                )}
            </section>
        </main>
    );
};