import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './screens/Home';
import { BookDetails } from './screens/BookDetails';

function App() {
  return (
    // BrowserRouter envuelve todo para habilitar la navegación
    <BrowserRouter>
      <Header />
      
      <Routes>
        {/* Cuando la URL está vacía ("/"), muestra la Home */}
        <Route path="/" element={<Home />} />
        
        {/* Cuando la URL es "/libro", muestra el detalle */}
        <Route path="/libro/:ean" element={<BookDetails />} />
      </Routes>
      
      <footer>
          <p>Impulsado por la red de gestión integral para librerías.</p>
      </footer>
    </BrowserRouter>
  )
}

export default App;