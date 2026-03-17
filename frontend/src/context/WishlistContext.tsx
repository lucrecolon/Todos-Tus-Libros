import { createContext, useContext, useState, useEffect } from 'react';
import { type ReactNode } from 'react';

export interface WishlistItem {
    ean: string;
    titulo: string;
    autor: string;
    imagen_tapa: string;
    libreria: string; 
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    toggleWishlist: (item: WishlistItem) => void;
    isInWishlist: (ean: string, libreria: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
        const guardado = localStorage.getItem('ultra_wishlist');
        return guardado ? JSON.parse(guardado) : [];
    });

    useEffect(() => {
        localStorage.setItem('ultra_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (item: WishlistItem) => {
        setWishlist(prev => {
            const yaExiste = prev.some(libro => libro.ean === item.ean && libro.libreria === item.libreria);
            
            if (yaExiste) {
                return prev.filter(libro => !(libro.ean === item.ean && libro.libreria === item.libreria));
            } else {
                return [...prev, item];
            }
        });
    };

    const isInWishlist = (ean: string, libreria: string) => {
        return wishlist.some(libro => libro.ean === ean && libro.libreria === libreria);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist debe usarse dentro de un WishlistProvider");
    return context;
};