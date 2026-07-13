import { type DetalleLibro } from '../types/models';

const API_BASE_URL = import.meta.env.DEV 
    ? '/api/external/consulta' 
    : 'https://apiultragestion.com.ar/api/external/consulta';
const TOKEN = import.meta.env.VITE_ULTRA_TOKEN;

export interface FiltrosBusqueda {
    titulo?: string;
    autor?: string;
    editorial?: string;
    page?: number;
    novedades?: string;
}

export interface ResultadoBusquedaPaginada {
    count: number;
    next: string | null;
    previous: string | null;
    results: any[];
}

export const buscarLibrosAvanzado = async (filtros: FiltrosBusqueda): Promise<ResultadoBusquedaPaginada> => {
    const query = new URLSearchParams();
    
    if (filtros.titulo) query.append('titulo', filtros.titulo);
    if (filtros.autor) query.append('autor', filtros.autor);
    if (filtros.editorial) query.append('editorial', filtros.editorial);
    if (filtros.page) query.append('page', filtros.page.toString());
    if (filtros.novedades) query.append('novedades', filtros.novedades);

    const url = `${API_BASE_URL}/?${query.toString()}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': TOKEN, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Error en la API');
        
        const data = await response.json();
        
        return {
            count: data.count || 0,
            next: data.next || null,
            previous: data.previous || null,
            results: data.results || []
        };
    } catch (error) {
        console.error("Error buscando libros:", error);
        return { count: 0, next: null, previous: null, results: [] };
    }
};

export const buscarLibrosPorTitulo = async (titulo: string): Promise<DetalleLibro[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/?titulo=${titulo}`, {
            method: 'GET',
            headers: {
                'Authorization': TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        return data.results || []; 
        
    } catch (error) {
        console.error("Hubo un problema con la búsqueda:", error);
        return [];
    }
};

export const buscarLibroPorEan = async (ean: string): Promise<DetalleLibro | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${ean}`, {
            method: 'GET',
            headers: {
                'Authorization': TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al buscar el libro');
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Hubo un problema:", error);
        return null;
    }
};


// API DE USUARIOS
const API_USUARIOS_URL = import.meta.env.DEV 
    ? 'http://localhost:8040/api' 
    : 'https://api.todostuslibrosar.com.ar/api';

export const registrarUsuarioBase = async (email: string, password: string) => {
    try {
        await inicializarCSRF();
        
        const csrfToken = localStorage.getItem('token_csrf_seguro');

        const response = await fetch(`${API_USUARIOS_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Error al crear la cuenta. Verificá los datos.');
        }

        const loginData = await loginUsuario(email, password);
        
        return loginData;

    } catch (error) {
        console.error("Error en registrarUsuarioBase:", error);
        throw error;
    }
};

export const loginUsuario = async (email: string, password: string) => {
    try {
        await inicializarCSRF();
        const csrfToken = localStorage.getItem('token_csrf_seguro');

        console.log("Token leído:", csrfToken, "| Largo:", csrfToken?.length);

        const response = await fetch(`${API_USUARIOS_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify({ username: email, password }) 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Error al iniciar sesión. Verificá tu email y contraseña.');
        }

        await inicializarCSRF();

        return await response.json();
    } catch (error) {
        console.error("Error en loginUsuario:", error);
        throw error;
    }
};

export const obtenerPerfilUsuario = async () => {
    const response = await fetch(`${API_USUARIOS_URL}/user/me/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('No se pudo cargar el perfil');
    }

    return await response.json();
};

export const logoutUsuario = async () => {
    try {
        const csrfToken = localStorage.getItem('token_csrf_seguro');

        const response = await fetch(`${API_USUARIOS_URL}/logout/`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '', 
            },
            credentials: 'include' 
        });

        if (!response.ok) {
            throw new Error('El servidor rechazó el cierre de sesión');
        }
    } catch (error) {
        console.error("Error al cerrar sesión", error);
    }
};

export const inicializarCSRF = async () => {
    try {
        const response = await fetch(`${API_USUARIOS_URL}/csrf/`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.csrfToken) {
            localStorage.setItem('token_csrf_seguro', data.csrfToken);
        }
        
    } catch (error) {
        console.error("Error obteniendo CSRF token", error);
    }
};

export const agregarDireccion = async (direccionData: any) => {
    const csrfToken = localStorage.getItem('token_csrf_seguro');

    try {
        const response = await fetch(`${API_USUARIOS_URL}/user/address/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify(direccionData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Error al guardar la dirección');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en agregarDireccion:", error);
        throw error;
    }
};

export const modificarDireccion = async (id: number, direccionData: any) => {
    const csrfToken = localStorage.getItem('token_csrf_seguro');

    try {
        const response = await fetch(`${API_USUARIOS_URL}/user/address/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify(direccionData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Error al modificar la dirección');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en modificarDireccion:", error);
        throw error;
    }
};

export const eliminarDireccion = async (id: number) => {
    const csrfToken = localStorage.getItem('token_csrf_seguro');

    try {
        const response = await fetch(`${API_USUARIOS_URL}/user/address/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Error al eliminar la dirección');
        }
        return true; 
    } catch (error) {
        console.error("Error en eliminarDireccion:", error);
        throw error;
    }
};

export const actualizarPerfilUsuario = async (datosPerfil: any) => {
    const csrfToken = localStorage.getItem('token_csrf_seguro');

    try {
        const response = await fetch(`${API_USUARIOS_URL}/user/me/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify(datosPerfil)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar los datos del perfil');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en actualizarPerfilUsuario:", error);
        throw error;
    }
};

export const modificarPerfil = async (datosPersonales: any) => {
    const csrfToken = localStorage.getItem('token_csrf_seguro');
    try {
        const response = await fetch(`${API_USUARIOS_URL}/user/me/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify(datosPersonales)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Error al modificar el perfil');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en modificarPerfil:", error);
        throw error;
    }
};

export const obtenerPaises = async () => {
    const res = await fetch(`${API_USUARIOS_URL}/countries/`, { credentials: 'include' });
    return res.json();
};

export const obtenerProvincias = async (paisId: number) => {
    const res = await fetch(`${API_USUARIOS_URL}/states/?country=${paisId}`, { credentials: 'include' });
    return res.json();
};

export const obtenerCiudades = async (provinciaId: number) => {
    const res = await fetch(`${API_USUARIOS_URL}/cities/?state=${provinciaId}`, { credentials: 'include' });
    return res.json();
};