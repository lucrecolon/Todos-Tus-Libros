interface ConfirmModalProps {
    titulo: string;
    mensaje: string;
    textoConfirmar?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({ titulo, mensaje, textoConfirmar = "Confirmar", onConfirm, onCancel }: ConfirmModalProps) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-dark)', fontFamily: 'Georgia, serif' }}>{titulo}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14px', textTransform: 'none' }}>
                    {mensaje}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={onCancel}
                        style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold' }}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        style={{ flex: 1, padding: '10px', background: 'var(--accent-bordeaux)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
                    >
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};