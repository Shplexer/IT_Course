'use client';
import { useState, useEffect } from 'react';
import { createCookie } from './shopCookies';
import Link from 'next/link';

export default function BuyButton({ productId, initQuantity = 0 }) {
  const [quantity, setQuantity] = useState(initQuantity);
  
  useEffect(() => {
    if (quantity !== initQuantity) {
      const dataToSaveToCookies = {
        productId: productId,
        quantity: quantity
      };
      createCookie({ dataToSaveToCookies });
    }
  }, [quantity, productId, initQuantity]);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  const handleAdd = () => {
    setQuantity(1);
  }

  return (
    <div className="quantity-control">
      {quantity === 0 ? (
        <button className="buy-button" onClick={handleAdd}>
          Купить
        </button>
      ) : (
        <div className="quantity-selector">
          <button className="quantity-button minus" onClick={handleDecrement}>
            -
          </button>
          <Link href={'/cart'}>
            <button className="buy-button">
              В корзине: {quantity} шт.
            </button>
          </Link>
          <button className="quantity-button plus" onClick={handleIncrement}>
            +
          </button>
        </div>
      )}
    </div>
  );
}