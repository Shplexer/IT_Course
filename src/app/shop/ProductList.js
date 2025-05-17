
'use server';
import connection from "@/app/_lib/db";
import Link from "next/link";
import { getCart } from "@/app/_lib/cookies";
import BuyButton from "./BuyButton";
import '../../../public/general.css';
import '../globals.css';
import 'rc-slider/assets/index.css';
import styles from "./shopNew.module.css"
import { fetchProductsByFilters } from "../_lib/products";

export default async function ProductList({ filters }) {
  const cart = await getCart();
  const products = await fetchProductsByFilters(filters);
  return (
    <div className={styles["products-wrap"]}>
      {products.length > 0 ? (
        products.map(product => {
          const maxQuantity = product.amount;
          const cartItem = cart.find(item => item.productId === product.prodid);
          const initialQuantity = cartItem ? cartItem.quantity : 0;

          return (
            <div key={product.prodid} className={styles[`products-item-wrap`]}>
                <Link href={`shop/${product.prodid}`}>
                <img
                  className={styles["products-item-pic"]}
                  src={`/products/${product.picpath}` || '/products/default.png'}
                  alt={product.name}
                />
                <h3 className={styles["products-item-name"]}>{product.name}</h3>
                <div className={styles["price-wrap"]}>
                  <p className={`${product.isonsale ? `${styles["onSale"]}` : ''} ${styles["products-item-price"]}`}>{product.price} руб.</p>
                  {product.isonsale && <p className={styles["products-item-sale-price"]}>{product.saleprice} руб.</p>}
                </div>
                </Link>
                <BuyButton
                  productId={product.prodid}
                  unit_price={product.isonsale ? product.saleprice : product.price}
                  initQuantity={initialQuantity}
                  totalQuantity={maxQuantity}
                />
              </div>
          );
        })
      ) : (
        <div className={styles["no-products"]}>Товары не найдены</div>
      )}
    </div>
  );
}

