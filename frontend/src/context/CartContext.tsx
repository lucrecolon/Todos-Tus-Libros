import { createContext, useContext, useState } from 'react';
import { type ReactNode } from 'react';

interface CartContextType {
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    cartCount: number;
    setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    return (
        <CartContext.Provider value={{ cartOpen, setCartOpen, cartCount, setCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

// hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
    return context;
};
