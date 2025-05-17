'use client';
import { removeFromCart } from "@/app/_lib/cookies";
import styles from "./cart.module.css"
export default function DeleteButton({ productId }) {
  
  const handleDelete = async () => {
    await removeFromCart(productId);
  };

  return (
    <img 
      src="/icons/close.png" 
      className={styles["delete-icon"]} 
      onClick={handleDelete}
      alt="Delete item"
    />
  );
}