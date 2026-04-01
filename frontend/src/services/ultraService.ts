import { type DetalleLibro } from '../types/models';

const API_BASE_URL = 'https://apiultragestion.com.ar/api/external/consulta';
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

    const url = `${API_BASE_URL}?${query.toString()}`;
    
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