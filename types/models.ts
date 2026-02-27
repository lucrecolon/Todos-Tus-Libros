export interface Autor {
    nombre: string;
    apellido: string;
}

export interface Editorial {
    nombre: string;
}

export interface StockLibreria {
    libreria: string;
    stock: number;   
    precio: string;  
}

export interface DetalleLibro {
    ean: string;
    isbn: string;
    titulo: string;
    precio: number;       
    sinopsis: string
    imagen_tapa: string;  
    autor: Autor;
    editorial: Editorial;
    en_librerias: StockLibreria[];
}