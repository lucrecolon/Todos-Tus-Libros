import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="main-container" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            <h1 style={{ fontSize: '80px', color: 'var(--brand-color)', margin: '0', lineHeight: '1' }}> 404 </h1>
            
            <h2 style={{ fontFamily: 'Georgia, serif', color: 'var(--text-dark)', fontSize: '28px' }}>
                Página no encontrada
            </h2>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px', maxWidth: '500px' }}>
                Parece que te perdiste entre las estanterías. La página o el libro que estás buscando no existe o fue movida a otra sección.
            </p>
            
            <button 
                className="btn-add-cart" 
                onClick={() => navigate('/')}
                style={{ padding: '15px 30px', fontSize: '15px', width: 'auto' }}
            >
                VOLVER AL INICIO
            </button>
            
        </div>
    );
};