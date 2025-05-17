'use server'
import Link from "next/link";
import connection from "../_lib/db";
import { getCart } from "@/app/_lib/cookies";
import styles from "./cart.module.css"
import DeleteButton from "./deleteButton";
import { fetchProductsByIDs } from "../_lib/products";

export default async function Cart() {
    const cart = await getCart();
    const products = await fetchProductsByIDs([cart.map(item => item.productId)]);

    return (
        <div className={styles["cart-container"]}>
            <h1 className={styles["cart-title"]}>Корзина</h1>
            {products.length === 0 ? (
                <p className={styles["empty-cart-message"]}>Корзина пуста</p>
            ) : (
                <div className={styles["cart-items"]}>
                    {products.map((product, index) => {
                        const cartItem = cart.find(item => Number(item.productId) === Number(product.prodid));
                        const price = product.isonsale ? product.saleprice : product.price;
                        const total = cartItem ? (price * cartItem.quantity).toFixed(2) : 0;

                        return (
                            <div key={`${product.prodid}-${index}`} className={styles["cart-item"]} style={{ position: 'relative' }}>
                                <Link href={`/shop/${product.prodid}`} key={`link-${product.prodid}-${index}`} style={{ display: `flex` }}>
                                    <div className={styles["product-image-container"]}>
                                        <img
                                            src={`/products/${product.picpath}` || './products/default.png'}
                                            alt={product.name}
                                            className={styles["product-image"]}
                                        />
                                    </div>
                                    <div className={styles["product-details"]}>
                                        <div className={styles["upper-container"]}>
                                            <h2 className={styles["product-name"]}>{product.name}</h2>
                                        </div>
                                        <p>Цена: </p>
                                        <p className={`${product.isonsale ? `${styles["onSale"]}` : ''} ${styles["product-price"]}`}>
                                            {product.price} руб.
                                        </p>
                                        {product.isonsale && <p className={`${styles["product-sale-price"]}`}>{product.saleprice} руб.
                                            <span className={styles["sale-badge"]}>Скидка!</span></p>}
                                        <div className={styles["quantity-control"]}>
                                            <p>Количество: {cartItem ? cartItem.quantity : ''} шт.</p>
                                        </div>
                                        <p className={styles["item-total"]}>Итог: {total} руб.</p>
                                    </div>
                                </Link>

                                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                    <DeleteButton productId={product.prodid} />
                                </div>
                            </div>
                        );
                    })}
                    <div className={styles["cart-summary"]}>
                        <p className={styles["cart-total"]}>
                            Итог: {products.reduce((sum, product) => {
                                const cartItem = cart.find(item => Number(item.productId) === Number(product.prodid));
                                const price = product.isonsale ? product.saleprice : product.price;
                                return sum + (cartItem ? price * cartItem.quantity : 0);
                            }, 0).toFixed(2)} руб.
                        </p>
                        <Link href={"/checkout"}>
                            <button className={styles["checkout-button"]}>Оформить заказ</button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}