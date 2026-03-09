import { type DetalleLibro } from '../types/models';

const API_BASE_URL = '/api/external/consulta';
const TOKEN = import.meta.env.VITE_ULTRA_TOKEN;

export interface FiltrosBusqueda {
    titulo?: string;
    autor?: string;
    editorial?: string;
    page?: number;
}

export const buscarLibrosAvanzado = async (filtros: FiltrosBusqueda) => {
    const query = new URLSearchParams();
    
    if (filtros.titulo) query.append('titulo', filtros.titulo);
    if (filtros.autor) query.append('autor', filtros.autor);
    if (filtros.editorial) query.append('editorial', filtros.editorial);
    
    if (filtros.page) query.append('page', filtros.page.toString());

    const url = `${API_BASE_URL}/?${query.toString()}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': import.meta.env.VITE_ULTRA_TOKEN, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Error en la API');
        const data = await response.json();
        return data.results || []; 
    } catch (error) {
        console.error("Error buscando libros:", error);
        return [];
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