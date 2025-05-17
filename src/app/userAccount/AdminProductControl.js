"use client"
import Link from "next/link";
import styles from "./userAccount.module.css";

export default function AdminProductControl({products}) {
    return (
        <div className={styles["product-panel"]}>
            <div className={styles["panel-header"]}>
                <h2>Управление товарами</h2>
                <Link href="/admin/products/new" className={styles["add-product-button"]}>
                    Добавить новый товар
                </Link>
            </div>

            <div className={styles["products-grid"]}>
                {products.map((product) => (
                    <div key={product.id} className={styles["product-card"]}>
                        <div className={styles["product-image"]}>
                            <img
                                 src={`/products/${product.path_to_pic}` || '/products/default.png'}
                                alt={product.product_name}
                            />
                        </div>
                        <div className={styles["product-info"]}>
                            <h3>{product.product_name}</h3>
                            <div className={styles["price-section"]}>
                                {product.is_on_sale ? (
                                    <>
                                        <span className={styles["sale-price"]}>{product.sale_price} руб.</span>
                                        <span className={styles["original-price"]}>{product.price} руб.</span>
                                    </>
                                ) : (
                                    <span>{product.price} руб.</span>
                                )}
                            </div>
                            <div className={styles["details-row"]}>
                                <span>Категория:</span>
                                <span>{product.type_name}</span>
                            </div>
                            <div className={styles["details-row"]}>
                                <span>Наличие:</span>
                                <span className={product.available_amount > 0 ? styles["in-stock"] : styles["out-of-stock"]}>
                                    {product.available_amount > 0 ?
                                        `В наличии (${product.available_amount} шт.)` :
                                        "Нет в наличии"}
                                </span>
                            </div>
                            <div className={styles["details-row"]}>
                                <span>Акция:</span>
                                <span className={product.is_promo ? styles["promo-on"] : styles["promo-off"]}>
                                    {product.is_promo ? "Да" : "Нет"}
                                </span>
                            </div>
                            <div className={styles["product-actions"]}>
                                <Link
                                    href={`/admin/products/edit/${product.id}`}
                                    className={styles["edit-button"]}
                                >
                                    Редактировать
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>            
    );
}