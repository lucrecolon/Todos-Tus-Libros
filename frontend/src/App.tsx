import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './screens/Home';
import { BookDetails } from './screens/BookDetails';
import { CartProvider } from './context/CartContext';
import { CartSidebar } from './components/CartSideBar';
import { BookSearch } from './screens/BookSearch';
import { WishlistProvider } from './context/WishlistContext';
import { Wishlist } from './screens/Wishlist';
import { Novedades } from './screens/Novedades';
import { Register } from './screens/Register';
import { User } from './screens/User';
import { NotFound } from './screens/NotFound';
import { CategoryNav } from './components/CategoryNav';

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Header />
          <CategoryNav />
          <CartSidebar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/libro/:ean" element={<BookDetails />} />
            <Route path="/buscar" element={<BookSearch />} />
            <Route path="/favoritos" element={<Wishlist />} />
            <Route path="/novedades" element={<Novedades />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/user/me" element={<User />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <footer>
              <p>Ultra Gestión ® 2026. Impulsado por la red de gestión integral para librerías.</p>
          </footer>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  )
}

export default App;