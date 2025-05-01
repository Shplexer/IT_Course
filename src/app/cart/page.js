'use server'
import connection from "../lib/db";
import { getCart } from "../shop/shopCookies";
import "./cart.css"
async function fetchProducts(cart) {
    const productIds = cart.map(item => item.productId);
    let client;
    try {
        client = await connection.connect();
        const result = await connection.query(`
        SELECT
            products.name, 
            products.id as prodid,
            products.picId as picId,
            products.properties as props,
            products.price,
            products.isonsale,
            products.saleprice,
            pictures.path as picPath,
            "types".name as typeName
        FROM products
        INNER JOIN pictures ON products.picid = pictures.id
        INNER JOIN "types" ON products.typeid = "types".id
        WHERE products.id = ANY($1::int[]);
        `, [productIds]);
        return result.rows;
    } catch (err) {
        console.error("Error fetching products:", err);
        return [];
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export default async function Cart() {
    const cart = await getCart();
    const products = await fetchProducts(cart);

    return (
        <div className="cart-container">
            <h1 className="cart-title">Корзина</h1>
            {products.length === 0 ? (
                <p className="empty-cart-message">Корзина пуста</p>
            ) : (
                <div className="cart-items">
                    {products.map((product, index) => {
                        const cartItem = cart.find(item => Number(item.productId) === Number(product.prodid));
                        const price = product.isonsale ? product.saleprice : product.price;
                        const total = cartItem ? (price * cartItem.quantity).toFixed(2) : 0;
                        
                        return (
                            <div key={`${product.prodid}-${index}`} className="cart-item">
                                <div className="product-image-container">
                                    <img 
                                        src={`./products/${product.picpath}` || './products/default.png'}
                                        alt={product.name} 
                                        className="product-image"
                                    />
                                </div>
                                <div className="product-details">
                                    <h2 className="product-name">{product.name}</h2>
                                    <p className="product-price">
                                        Цена: {price} руб
                                        {product.isonsale && (
                                            <span className="sale-badge">SALE</span>
                                        )}
                                    </p>
                                    <div className="quantity-control">
                                        <p>Количество: {cartItem ? cartItem.quantity : ''}</p>
                                    </div>
                                    <p className="item-total">Итог: {total} руб.</p>
                                </div>
                            </div>
                        );
                    })}
                    <div className="cart-summary">
                        <p className="cart-total">
                            Итог: {products.reduce((sum, product) => {
                                const cartItem = cart.find(item => Number(item.productId) === Number(product.prodid));
                                const price = product.isonsale ? product.saleprice : product.price;
                                return sum + (cartItem ? price * cartItem.quantity : 0);
                            }, 0).toFixed(2)} руб.
                        </p>
                        <button className="checkout-button">Оформить заказ</button>
                    </div>
                </div>
            )}
        </div>
    );
}