import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { theme } from './theme'
import { ChakraProvider } from '@chakra-ui/react'
import { CartProvider } from './CartContext'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Composants Publics & Client
import Layout from './Layout.jsx'
import DynamicPage from './DynamicPage.jsx' // <-- NOM CORRECT
import MenuDetailPage from './MenuDetailPage.jsx'
import PersonnalisationPage from './PersonnalisationPage.jsx'
import SubscriptionPage from './SubscriptionPage.jsx'
import DailyMenuSelectionPage from './DailyMenuSelectionPage.jsx'
import TestEnvPage from './TestEnvPage.jsx'
import TestStripePage from './TestStripePage.jsx'
import AuthPage from './AuthPage.jsx'
import ResetPasswordPage from './ResetPasswordPage.jsx'
import CheckoutPage from './CheckoutPage.jsx'
import OrderSuccessPage from './OrderSuccessPage.jsx'
import AccountPage from './AccountPage.jsx' // <-- La page Compte

// Composants Admin
import AdminLayout from './AdminLayout.jsx'
import AdminRoute from './AdminRoute.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminMenusPage from './AdminMenusPage.jsx'
import AdminEditMenuPage from './AdminEditMenuPage.jsx'
import AdminDailyMenusPage from './AdminDailyMenusPage.jsx'
import AdminOrdersPage from './AdminOrdersPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Charge la session et le profil
    children: [
      // === ZONE CLIENT (Layout avec Header/Footer) ===
      {
        element: <Layout />, 
        children: [
          { path: '/', element: <DynamicPage /> },
          { path: '/test-env', element: <TestEnvPage /> },
          { path: '/test-stripe', element: <TestStripePage /> },
          { path: '/commander/personnalisation', element: <PersonnalisationPage /> },
          { path: '/abonnements', element: <SubscriptionPage /> },
          { path: '/menus-semaine', element: <DailyMenuSelectionPage /> },
          { path: '/:slug', element: <DynamicPage /> }, // <-- CORRECTION 2
          { path: '/menu/:menuId', element: <MenuDetailPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/commande/succes', element: <OrderSuccessPage /> },

          // C'EST ICI QUE DOIT ÊTRE LA ROUTE COMPTE
          // (Accessible aux users connectés, pas besoin d'être admin)
          { path: '/compte', element: <AccountPage /> },
        ]
      },
      
      // === ZONE LOGIN (Page pleine sans Header) ===
      {
        path: '/login',
        element: <AuthPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },

      // === ZONE ADMIN (Protégée par le rôle 'admin') ===
      {
        element: <AdminRoute />, 
        children: [
          {
            element: <AdminLayout />, 
            children: [
              { path: '/admin', element: <AdminDashboard /> },
              { path: '/admin/menus', element: <AdminMenusPage /> },
              { path: '/admin/menus/:menuId', element: <AdminEditMenuPage /> },
              { path: '/admin/menus-quotidiens', element: <AdminDailyMenusPage /> },
              { path: '/admin/commandes', element: <AdminOrdersPage /> }
            ]
          }
        ]
      }
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </CartProvider>
  </React.StrictMode>,
)