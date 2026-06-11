import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
import { Privacy } from './screens/PrivacyPolitics';
import { RutaProtegida } from './components/ProtectedRoutes';

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
            <Route path="/privacidad" element={<Privacy />} />

            <Route path="/user/me"
              element={
                <RutaProtegida>
                    <User />
                </RutaProtegida>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <footer>
            <a 
                href="https://ultragestion.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--text-light)', textDecoration: 'underline' }}
            >
                Ultra Gestión
            </a>
            , {new Date().getFullYear()}. Impulsado por la red de gestión integral para librerías.{' '}
            {' '}
            <Link to="/privacidad" style={{ color: 'var(--text-light)', textDecoration: 'underline' }}>Políticas de Privacidad</Link>.
        </footer>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  )
}

export default App;