import { createContext, useContext, useState, useEffect } from 'react';
import { type ReactNode } from 'react';

export interface CartItem {
    ean: string;
    titulo: string;
    precio: number;
    libreria: string;
}

interface CartContextType {
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    cartItems: CartItem[]; 
    addToCart: (item: CartItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const carritoGuardado = localStorage.getItem('ultra_cart');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    useEffect(() => {
        localStorage.setItem('ultra_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: CartItem) => {
        setCartItems([...cartItems, item]);
        setCartOpen(true);
    };

    return (
        <CartContext.Provider value={{ cartOpen, setCartOpen, cartItems, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
    return context;
};
