export interface Libro {
    id: string;
    isbn: string;
    titulo: string;
    autor: string;
    editorial: string;
    precio: number;
    portadaUrl?: string;
}

export interface Libreria {
    id: string;
    nombre: string;
    direccion: string;
    codigoPostal: string;
    stockDisponible?: number; 
}

export interface ItemCarrito {
    libro: Libro;
    cantidad: number;
}
