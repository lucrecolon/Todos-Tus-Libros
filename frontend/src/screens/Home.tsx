import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const [inputTitulo, setInputTitulo] = useState('');
    const [inputAutor, setInputAutor] = useState('');
    const navigate = useNavigate();

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
        </main>
    );
};