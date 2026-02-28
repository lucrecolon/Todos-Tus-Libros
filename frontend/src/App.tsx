import './App.css'
import { Prueba } from './components/prueba'

function App() {
    return (
      <div className="App">
        <Prueba name="Alice" msgCount={2} isLoggedIn={true} />
      </div>
      
  )
}

export default App
