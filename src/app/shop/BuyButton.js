'use client';
import { useState, useEffect } from 'react';
import { addToCart } from '@/app/_lib/cookies';
import Link from 'next/link';
import styles from "./shopNew.module.css"

export default function BuyButton({ productId, initQuantity = 0, totalQuantity, unit_price }) {
  console.log(`барабулька барабан`);
  const [quantity, setQuantity] = useState(initQuantity);

  useEffect(() => {
    if(quantity > totalQuantity){
      setQuantity(totalQuantity);
    }
    if (quantity !== initQuantity) {
      const dataToSaveToCookies = {
        productId: productId,
        quantity: quantity,
        unit_price: unit_price
      };
      addToCart({ dataToSaveToCookies });
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

  // If totalQuantity is 0, show "товары закончились" button
  if (totalQuantity === 0) {
    return (
      <div className={styles["quantity-control"]}>
        <button className={`${styles["buy-button"]} ${styles["out-of-stock"]}`} disabled>
          Товары закончились
        </button>
      </div>
    );
  }

  return (
    <div className={styles["quantity-control"]}>
      {quantity === 0 ? (
        <button className={styles["buy-button"]} onClick={handleAdd}>
          Купить
        </button>
      ) : (
        <div className={styles["quantity-selector"]}>
          <button className={`${styles["quantity-button"]} ${styles["minus"]}`} onClick={handleDecrement}>
            -
          </button>
          <Link href={'/cart'}>
            <button className={styles["buy-button"]}>
              В корзине: {quantity} шт.
            </button>
          </Link>
          {quantity < totalQuantity && 
            <button className={`${styles["quantity-button"]} ${styles["plus"]}`} onClick={handleIncrement}>
              +
            </button>
          }
        </div>
      )}
    </div>
  );
}