export const Privacy = () => {

    return (
        <div className="main-container" style={{ display: 'block', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            
            <h1 style={{ color: 'var(--text-dark)', fontFamily: 'Georgia, serif', marginBottom: '40px', fontSize: '2.5rem', textAlign: 'center' }}>
                Políticas de Privacidad
            </h1>
            
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>

                <h3 style={{ marginTop: '35px', color: 'var(--text-dark)', fontSize: '1.4rem' }}>1. Información que recopilamos</h3>
                <p>
                    En <strong>Todos Tus Libros</strong> recopilamos la información que nos proporcionás directamente al registrarte en nuestra plataforma, lo cual incluye tu nombre, apellido, dirección de correo electrónico, fecha de nacimiento y las direcciones de envío que agregues a tu perfil.
                </p>

                <h3 style={{ marginTop: '35px', color: 'var(--text-dark)', fontSize: '1.4rem' }}>2. Uso de la información</h3>
                <p>Utilizamos tus datos personales exclusivamente para:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li style={{ marginBottom: '8px' }}>Gestionar tu cuenta y mantener tu sesión activa.</li>
                    <li style={{ marginBottom: '8px' }}>Procesar tus compras y calcular los costos de envío o retiros en librería.</li>
                    <li style={{ marginBottom: '8px' }}>Mejorar tu experiencia en la plataforma guardando tus libros favoritos y el estado de tu carrito.</li>
                </ul>

                <h3 style={{ marginTop: '35px', color: 'var(--text-dark)', fontSize: '1.4rem' }}>3. Protección de tus datos</h3>
                <p>
                    Implementamos medidas de seguridad para proteger tu información personal. Tus contraseñas son encriptadas antes de ser almacenadas en nuestra base de datos. No vendemos, intercambiamos ni transferimos tu información a terceros bajo ninguna circunstancia sin tu consentimiento explícito.
                </p>

                <h3 style={{ marginTop: '35px', color: 'var(--text-dark)', fontSize: '1.4rem' }}>4. Tus derechos</h3>
                <p>
                    De acuerdo con la Ley de Protección de Datos Personales (Ley 25.326), tenés derecho a solicitar el acceso, rectificación, actualización o eliminación de tus datos personales en cualquier momento. Podés gestionar la mayoría de estos datos directamente desde la sección "Mi Cuenta".
                </p>

                <h3 style={{ marginTop: '35px', color: 'var(--text-dark)', fontSize: '1.4rem' }}>5. Contacto</h3>
                <p>
                    Si tenés alguna duda sobre estas Políticas de Privacidad o sobre cómo manejamos tus datos, podés contactarnos a través de los canales oficiales de soporte de la plataforma.
                </p>
                
                <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};