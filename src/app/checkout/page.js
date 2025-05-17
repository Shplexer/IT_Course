"use server"

import { fetchProductsByIDs } from "../_lib/products";
import { getCart } from "../_lib/cookies";
import styles from "./checkout.module.css";
import CheckoutButton from "../checkout/CheckoutUserData";

export default async function Checkout(){
    const cart = await getCart();
    let isLoggedIn = false;

    const products = await fetchProductsByIDs([cart.map(item => item.productId)]);
    let total = 0;
    


    return (
        <div className={styles["checkout-wrapper"]}>
            <h1>Оформление Заказа</h1>
            <div className={styles["order-data"]}>
                {products.length === 0 ? (
                    <p className={styles["empty-order-message"]}>Корзина пуста</p>
                ) : (
                    <div className={styles["order-items"]}>
                        {products.map((product, index) => {
                            const cartItem = cart.find(item => Number(item.productId) === Number(product.prodid));
                            const price = product.isonsale ? product.saleprice : product.price;
                            total += Number(cartItem ? (price * cartItem.quantity).toFixed(2) : 0);

                            return (
                                <div key={`${product.prodid}-${index}`} className={styles["order-item"]} style={{ position: 'relative' }}>
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <CheckoutButton total={total} products={products}/>
            </div>
        </div>
    );
}

async function createOrder(cart) {
    console.log(cart);
}