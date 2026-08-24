'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number; // prix déjà résolu (B2C ou B2B) au moment de l'ajout
  unit: string;
  quantity: number;
};

export type Cart = {
  id: string;
  label: string; // nom modifiable par l'acheteur, ex: "Commande de la semaine"
  producerId: string;
  producerName: string;
  items: CartItem[];
  createdAt: string;
};

type CartContextType = {
  carts: Cart[];
  activeCartId: string | null;
  setActiveCartId: (id: string) => void;
  // Ajoute un article à un panier précis (ciblage explicite), ou crée un panier
  // si aucun cartId n'est fourni et qu'aucun panier compatible n'existe.
  addItem: (
    cartId: string | null,
    producerId: string,
    producerName: string,
    item: Omit<CartItem, 'quantity'>,
    quantity?: number,
  ) => string; // retourne l'id du panier utilisé (utile si un nouveau a été créé)
  createCart: (producerId: string, producerName: string) => string;
  renameCart: (cartId: string, label: string) => void;
  removeCart: (cartId: string) => void;
  removeItem: (cartId: string, productId: string) => void;
  updateQuantity: (cartId: string, productId: string, quantity: number) => void;
  getCartsForProducer: (producerId: string) => Cart[];
  totalItemsAcrossCarts: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartTotal(cart: Cart) {
  return cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [activeCartId, setActiveCartId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCarts = localStorage.getItem('carts');
    const storedActive = localStorage.getItem('active_cart_id');
    if (storedCarts) setCarts(JSON.parse(storedCarts));
    if (storedActive) setActiveCartId(storedActive);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('carts', JSON.stringify(carts));
    if (activeCartId) localStorage.setItem('active_cart_id', activeCartId);
  }, [carts, activeCartId, loaded]);

  function createCart(producerId: string, producerName: string): string {
    const existingForProducer = carts.filter((c) => c.producerId === producerId).length;
    const newCart: Cart = {
      id: crypto.randomUUID(),
      // Numérote automatiquement s'il y a déjà un panier chez ce producteur
      // ("Panier Ferme Koudjo", puis "Panier Ferme Koudjo (2)")
      label: existingForProducer > 0 ? `Panier ${producerName} (${existingForProducer + 1})` : `Panier ${producerName}`,
      producerId,
      producerName,
      items: [],
      createdAt: new Date().toISOString(),
    };
    setCarts((prev) => [...prev, newCart]);
    setActiveCartId(newCart.id);
    return newCart.id;
  }

  function addItem(
    cartId: string | null,
    producerId: string,
    producerName: string,
    item: Omit<CartItem, 'quantity'>,
    quantity = 1,
  ): string {
    // Ciblage explicite d'un panier existant : on vérifie juste qu'il appartient
    // bien à ce producteur (la règle "un producteur par panier" reste vraie
    // À L'INTÉRIEUR d'un panier, elle ne s'applique simplement plus entre paniers).
    let targetId = cartId;
    if (targetId) {
      const target = carts.find((c) => c.id === targetId);
      if (!target || target.producerId !== producerId) {
        throw new Error('Ce panier appartient à un autre producteur.');
      }
    } else {
      // Aucun panier précisé : on en crée un nouveau plutôt que de deviner
      targetId = createCart(producerId, producerName);
    }

    setCarts((prev) =>
      prev.map((cart) => {
        if (cart.id !== targetId) return cart;
        const existing = cart.items.find((i) => i.productId === item.productId);
        const items = existing
          ? cart.items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...cart.items, { ...item, quantity }];
        return { ...cart, items };
      }),
    );
    setActiveCartId(targetId);
    return targetId;
  }

  function renameCart(cartId: string, label: string) {
    setCarts((prev) => prev.map((c) => (c.id === cartId ? { ...c, label } : c)));
  }

  function removeCart(cartId: string) {
    setCarts((prev) => prev.filter((c) => c.id !== cartId));
    if (activeCartId === cartId) setActiveCartId(null);
  }

  function removeItem(cartId: string, productId: string) {
    setCarts((prev) =>
      prev.map((c) => (c.id === cartId ? { ...c, items: c.items.filter((i) => i.productId !== productId) } : c)),
    );
  }

  function updateQuantity(cartId: string, productId: string, quantity: number) {
    if (quantity <= 0) return removeItem(cartId, productId);
    setCarts((prev) =>
      prev.map((c) =>
        c.id === cartId
          ? { ...c, items: c.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) }
          : c,
      ),
    );
  }

  function getCartsForProducer(producerId: string) {
    return carts.filter((c) => c.producerId === producerId);
  }

  const totalItemsAcrossCarts = carts.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        carts,
        activeCartId,
        setActiveCartId,
        addItem,
        createCart,
        renameCart,
        removeCart,
        removeItem,
        updateQuantity,
        getCartsForProducer,
        totalItemsAcrossCarts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé à l\'intérieur de CartProvider');
  return context;
}

export { cartTotal };
