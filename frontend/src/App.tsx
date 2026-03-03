import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './screens/Home';
import { BookDetails } from './screens/BookDetails';
import { CartProvider } from './context/CartContext';
import { CartSidebar } from './components/CartSideBar';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header />

        <CartSidebar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/libro/:ean" element={<BookDetails />} />
        </Routes>
        
        <footer>
            <p>Impulsado por la red de gestión integral para librerías.</p>
        </footer>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App;