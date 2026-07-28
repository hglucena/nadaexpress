import { Outlet } from 'react-router-dom'
import PopupBoasVindas from './components/pressao/PopupBoasVindas'
import PopupIntencaoSaida from './components/pressao/PopupIntencaoSaida'
import PopupEscolhaForcada from './components/pressao/PopupEscolhaForcada'

export default function App() {
  return (
    <div className="min-h-screen">
      <Outlet />
      <PopupBoasVindas />
      <PopupIntencaoSaida />
      <PopupEscolhaForcada />
    </div>
  )
}
