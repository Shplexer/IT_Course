"use client"
import Link from "next/link";
import { useState } from "react";
import { deleteProduct } from "../_lib/products";
import styles from "./userAccount.module.css";

export default function AdminProductControl({ products: initialProducts }) {
    const [products, setProducts] = useState(initialProducts);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState(null);

    const handleDelete = async (productId) => {
        setProcessingId(productId);
        setError(null);
        try {
            const result = await deleteProduct(productId);
            if (result.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
            } else {
                setError(result.error || "Не удалось удалить товар");
            }
        } catch (err) {
            setError(err.message || "Произошла ошибка при удалении");
            console.error("Delete failed:", err);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className={styles["product-panel"]}>
            <div className={styles["panel-header"]}>
                <h2>Управление товарами</h2>
                <Link href="/admin/products/new" className={styles["add-product-button"]}>
                    Добавить новый товар
                </Link>
            </div>

            {error && <div className={styles.error}>{error}</div>}

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
                                <span className={product.is_on_sale ? styles["promo-on"] : styles["promo-off"]}>
                                    {product.is_on_sale ? "Да" : "Нет"}
                                </span>
                            </div>
                            <div className={styles["product-actions"]}>
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    className={styles["edit-button"]}
                                >
                                    Редактировать
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={processingId === product.id}
                                    className={styles["delete-button"]}
                                >
                                    {processingId === product.id ? "Удаление..." : "Удалить"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>            
    );
}