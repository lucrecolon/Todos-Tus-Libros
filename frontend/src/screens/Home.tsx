import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';
import { useWishlist } from '../context/WishlistContext';


export const Home = () => {
    const [inputTitulo, setInputTitulo] = useState('');
    const [inputAutor, setInputAutor] = useState('');
    const [destacados, setDestacados] = useState<DetalleLibro[]>([]);
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();


    useEffect(() => {
        const cargarDestacados = async () => {
            const busquedasAleatorias = ['borges', 'cortazar', 'harry potter', 'king', 'isabel allende', 'orwell'];
            
            const busquedaRandom = busquedasAleatorias[Math.floor(Math.random() * busquedasAleatorias.length)];
            
            const librosPorDefecto = await buscarLibrosAvanzado({ titulo: busquedaRandom }); 
            
            setDestacados(librosPorDefecto.slice(0, 5));
        };
        
        cargarDestacados();
    }, []);

    const ejecutarBusqueda = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputTitulo.trim() && !inputAutor.trim()) return;
        
        const params = new URLSearchParams();
        if (inputTitulo) params.append('titulo', inputTitulo);
        if (inputAutor) params.append('autor', inputAutor);
        
        navigate(`/buscar?${params.toString()}`); 
    };

    const novedadesMock = [
        { ean: "9789877694383", titulo: "UNA CASA SOLA", autor: { nombre: "Selva", apellido: "Almada" }, precio_tienda:29999, nombre_libreria: "RANDOM HOUSE", imagen_tapa: "http://static.megustaleer.com.ar/images/libros_244_x/9789877694383.jpg" },
        { ean: "9786313013081", titulo: "CABRON", autor: { nombre: "Reinaldo", apellido: "Sietecase" }, precio_tienda: 29999, nombre_libreria: "ALFAGUARA", imagen_tapa: "http://static.megustaleer.com.ar/images/libros_244_x/9786313013081.jpg" },
        { ean: "9789870761716", titulo: "CUADERNO INGLES (PREMIO CLARIN 2025)", autor: { nombre: "Daniel", apellido: "Morales" }, precio_tienda: 29999, nombre_libreria: "ALFAGUARA", imagen_tapa: "http://static.megustaleer.com.ar/images/libros_244_x/9789870761716.jpg" }
    ];

    return (
        <main>
            <section className="hero-section">
                <h1>Encontrá tu próxima lectura en<br />la librería más cercana</h1>
                <p className="hero-subtitle">Buscá entre miles de títulos combinando datos.</p>
                
                <form onSubmit={ejecutarBusqueda} style={{ 
                    display: 'flex', gap: '15px', backgroundColor: 'rgba(255,255,255,0.95)', 
                    padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
                }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '5px' }}>Título / ISBN</label>
                        <input 
                            type="text" 
                            value={inputTitulo}
                            onChange={(e) => setInputTitulo(e.target.value)}
                            placeholder="Ej: Rayuela"
                            style={{ width: '100%', padding: '12px', border: '1px solid #CCC', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '5px' }}>Autor (Apellido)</label>
                        <input 
                            type="text" 
                            value={inputAutor}
                            onChange={(e) => setInputAutor(e.target.value)}
                            placeholder="Ej: Cortazar"
                            style={{ width: '100%', padding: '12px', border: '1px solid #CCC', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="search-btn" style={{ height: '43px', padding: '0 30px' }}>
                            Buscar
                        </button>
                    </div>
                </form>
            </section>

            <div className="novedades-section">
                <h2 className="novedades-title">
                    Novedades del mes
                </h2>
                
                <div className="results-list">
                    {novedadesMock.map((pub, index) => (
                        <div key={`novedad-${pub.ean}-${index}`} className="result-item">
                            
                            <button className="wishlist-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist({
                                        ean: pub.ean,
                                        titulo: pub.titulo,
                                        autor: pub.autor.nombre ? `${pub.autor.nombre} ${pub.autor.apellido}` : pub.autor.apellido,
                                        imagen_tapa: pub.imagen_tapa,
                                        libreria: pub.nombre_libreria
                                    });
                                }}
                                title={isInWishlist(pub.ean, pub.nombre_libreria) ? "Quitar de favoritos" : "Agregar a favoritos"}
                            >
                                {isInWishlist(pub.ean, pub.nombre_libreria) ? '❤️' : '🤍'}
                            </button>

                            <div className="result-item-top">
                                <div className="result-image-wrapper" onClick={() => navigate(`/libro/${pub.ean}`)}>
                                    <img src={pub.imagen_tapa} alt={pub.titulo} className="result-image" />
                                </div>
                                <div className="result-info">
                                    <h3 className="result-title" onClick={() => navigate(`/libro/${pub.ean}`)}>{pub.titulo}</h3>
                                    <p className="result-author">Por {pub.autor.nombre ? `${pub.autor.nombre} ${pub.autor.apellido}` : pub.autor.apellido}</p>
                                    <div className="vendor-badge">
                                        <p className="vendor-title">Editorial: {pub.nombre_libreria}</p>
                                    </div>
                                    <div className="result-price">${pub.precio_tienda.toLocaleString('es-AR')}</div> 
                                </div>
                            </div>
                            
                            <button className="btn-add-cart" 
                                onClick={() => navigate(`/libro/${pub.ean}`)}
                            >
                                VER DISPONIBILIDAD
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <section className="content-section">
                <div className="section-title">
                    <h2>Descubrí estas lecturas</h2>
                    <a href="#" className="view-all">Ver todos</a>
                </div>

                <div className="books-grid">
                    {destacados.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Cargando recomendaciones...</p>
                    ) : (
                        destacados.map((libro) => (
                            <div className="book-card" key={libro.ean} onClick={() => navigate(`/libro/${libro.ean}`)} style={{ cursor: 'pointer' }}>
                                {libro.imagen_tapa ? (
                                    <img 
                                        src={libro.imagen_tapa} 
                                        alt={`Portada de ${libro.titulo}`} 
                                        className="book-cover-mock" 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <div className="book-cover-mock">Sin portada</div>
                                )}
                                
                                <h3 className="book-title-mock">{libro.titulo}</h3>
                                
                                <p className="book-author-mock">
                                    {libro.autor ? `${libro.autor.nombre} ${libro.autor.apellido}` : 'Autor no especificado'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </section>
            
        </main>
    );
};