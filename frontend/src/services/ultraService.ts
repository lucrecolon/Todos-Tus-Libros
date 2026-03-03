import { type DetalleLibro } from '../types/models';

const API_BASE_URL = '/api/external/consulta';
const TOKEN = import.meta.env.VITE_ULTRA_TOKEN;

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