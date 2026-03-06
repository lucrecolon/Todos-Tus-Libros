import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLibrosAvanzado } from '../services/ultraService';
import { type DetalleLibro } from '../types/models';

export const Home = () => {
    const [inputTitulo, setInputTitulo] = useState('');
    const [inputAutor, setInputAutor] = useState('');
    const [destacados, setDestacados] = useState<DetalleLibro[]>([]);
    const navigate = useNavigate();

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