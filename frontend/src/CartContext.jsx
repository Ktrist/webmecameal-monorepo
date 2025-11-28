import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // AMÉLIORATION : Gère la quantité
  const addToCart = (menu) => {
    const existingItem = cartItems.find((item) => item.id === menu.id)

    if (existingItem) {
      // S'il existe, on augmente la quantité
      setCartItems(
        cartItems.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      // S'il n'existe pas, on l'ajoute avec une quantité de 1
      setCartItems([...cartItems, { ...menu, quantity: 1 }])
    }
  }

  // NOUVEAU : Gère le +/-
  const updateQuantity = (menuId, amount) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === menuId) {
          const newQuantity = item.quantity + amount
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) // .filter(Boolean) retire les items (null) si leur quantité tombe à 0
    )
  }

  const removeFromCart = (menuId) => {
    setCartItems(cartItems.filter((item) => item.id !== menuId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  // On calcule le total
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity, // <-- Ajouté
    clearCart,
    itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0), // Le compteur totalise les quantités
    total, // <-- Ajouté
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  return useContext(CartContext)
}