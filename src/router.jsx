import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Produto from './pages/Produto'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import Pedido from './pages/Pedido'
import Roleta from './pages/Roleta'
import CaixaMisteriosa from './pages/CaixaMisteriosa'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'produto/:id', element: <Produto /> },
      { path: 'carrinho', element: <Carrinho /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'pedido/:id', element: <Pedido /> },
      { path: 'roleta', element: <Roleta /> },
      { path: 'caixa-misteriosa', element: <CaixaMisteriosa /> },
    ],
  },
])
