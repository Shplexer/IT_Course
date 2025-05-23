'use server'
import BuyButton from "../BuyButton";
import { getCart } from "@/app/_lib/cookies";
import styles from "./ProductPage.module.css";
import { fetchProductById2 } from "@/app/_lib/products";

export default async function ProductId({ params }) {
    const productId = (await params).productId;
    const product = await fetchProductById2(productId);
    const cart = await getCart();
    const cartItem = cart.find(item => item.productId === product.product_id);
    const initialQuantity = cartItem ? cartItem.quantity : 0;
    console.log(product)
    // Combine properties and attributes into a single array for display
    const allSpecs = [
        ...(product.properties || []),
        ...(product.attributes || [])
    ];

    return (
        <div className={styles["product-page-container"]}>
            <div className={styles["product-page"]}>
                <div className={styles["product-basic-info"]}>
                    <div className={styles["product-image-container"]}>
                        <img 
                            className={styles["product-img"]} 
                            src={`/products/${product.pic_path}`} 
                            alt={product.name}
                        />
                    </div>
                    <div className={styles["product-info"]}>
                        <h1 className={styles["product-name"]}>{product.name}</h1>
                        <p className={styles["product-type"]}>{product.product_type}</p>
                        <p className={styles["product-short-description"]}>{product.short_description}</p>
                        
                        <div className={styles["price-section"]}>
                            <span className={styles["product-price"]}>
                                {product.is_on_sale ? (
                                    <>
                                        <span className={styles["original-price"]}>{product.price} руб.</span>
                                        <span className={styles["sale-price"]}>{product.saleprice} руб.</span>
                                        <span className={styles["discount-badge"]}>Скидка!</span>
                                    </>
                                ) : (
                                    <span>{product.price} руб.</span>
                                )}
                            </span>
                        </div>

                        <div className={styles["product-actions"]}>
                            <BuyButton
                                productId={product.product_id}
                                initQuantity={initialQuantity}
                                totalQuantity={product.amount}
                            />
                            <p className={`${styles["product-amount"]} ${product.amount < 5 ? styles['low-stock'] : ''}`}>
                                {product.amount < 5 
                                    ? `Осталось мало: ${product.amount} шт.` 
                                    : `В наличии: ${product.amount} шт.`}
                            </p>
                        </div>

                        <div className={styles["product-key-specs"]}>
                            <h3>Основные характеристики:</h3>
                            <div className={styles["specs-grid"]}>
                                {allSpecs.slice(0, 4).map((spec, index) => (
                                    <div key={index} className={styles["spec-item"]}>
                                        <span className={styles["spec-name"]}>{spec.name}:</span>
                                        <span className={styles["spec-value"]}>{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles["product-detailed-info"]}>
                    <div className={styles["product-description-section"]}>
                        <h2>Описание товара</h2>
                        <div className={styles["description-content"]}>
                            {product.description.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    <div className={styles["product-specs-section"]}>
                        <h2>Все характеристики</h2>
                        <div className={styles["specs-table-container"]}>
                            <table className={styles["product-specs-table"]}>
                                <tbody>
                                    {allSpecs.map((spec, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                            <td className={styles["spec-name-cell"]}>{spec.name}</td>
                                            <td className={styles["spec-value-cell"]}>{spec.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}