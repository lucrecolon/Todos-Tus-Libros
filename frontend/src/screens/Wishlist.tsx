import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';

export const Wishlist = () => {
    const { wishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();

    return (
        <div className="main-container" style={{ flexDirection: 'column' }}>
            <h1 style={{ marginBottom: '30px', color: 'var(--text-dark)' }}>Mis Favoritos</h1>
            
            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-white)', borderRadius: '4px' }}>
                    <h2>Tu lista está vacía</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>¡Buscá los libros que tenés ganas de leer y guardalos acá!</p>
                    <button 
                        className="btn-add-cart" 
                        style={{ width: 'auto', padding: '10px 20px' }}
                        onClick={() => navigate('/')}
                    >
                        IR A BUSCAR LIBROS
                    </button>
                </div>
            ) : (
                <div className="results-list">
                    {wishlist.map((libro, index) => (
                        <div key={`${libro.ean}-${libro.libreria}-${index}`} className="result-item">
                            
                            <button 
                                className="wishlist-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(libro);
                                }}
                                title="Quitar de favoritos"
                            >❤️
                            </button>

                            <div className="result-item-top">
                                <div className="result-image-wrapper" onClick={() => navigate(`/libro/${libro.ean}`)}>
                                    {libro.imagen_tapa ? (
                                        <img src={libro.imagen_tapa} alt={libro.titulo} className="result-image" />
                                    ) : (
                                        <div className="book-cover-mock" style={{ height: '135px' }}>Sin portada</div>
                                    )}
                                </div>

                                <div className="result-info">
                                    <h3 className="result-title" onClick={() => navigate(`/libro/${libro.ean}`)}>{libro.titulo}</h3>
                                    <p className="result-author">Por {libro.autor}</p>
                                    
                                    <div className="vendor-badge">
                                        <p className="vendor-title">Guardado de: {libro.libreria}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};