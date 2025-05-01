
'use server';
import connection from "@/app/lib/db";
import { createCookie, getCart } from "./shopCookies";
import BuyButton from "./BuyButton";
import '../../../public/general.css';
import '../globals.css';
import 'rc-slider/assets/index.css';

// Function to fetch products data
async function fetchProducts(filters) {
  let client;
  try {
    client = await connection.connect();
    const result = await connection.query(`
    SELECT
        products.name, 
        products.id as prodId,
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
    WHERE
        (CASE WHEN products.isonsale = TRUE THEN products.saleprice ELSE products.price END) 
        BETWEEN $1 AND $2;
    `, [filters.price_min, filters.price_max]);
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

export default async function ProductList({ filters }) {
  const cart = await getCart();
  // Fetch products data synchronously
  const products = await fetchProducts(filters);
  
  return (
    <div className='products-wrap'>
      {products.length > 0 ? (
        products.map(product => {
          // Find the cart item that matches the current product
          const cartItem = cart.find(item => item.productId === product.prodid);
          // Determine the initial quantity (0 if not in cart, or the cart quantity if exists)
          const initialQuantity = cartItem ? cartItem.quantity : 0;
          
          return (
            <div key={product.prodid} className={`products-item-wrap`}>
              <img 
                className='products-item-pic' 
                src={`./products/${product.picpath}` || './products/default.png'} 
                alt={product.name} 
              />
              <h3 className='products-item-name'>{product.name}</h3>
              <div className='price-wrap'>
                <p className={`${product.isonsale ? 'onSale' : ''} products-item-price`}>{product.price} руб.</p>
                {product.isonsale && <p className='products-item-sale-price'>{product.saleprice} руб.</p>}
              </div>
              <BuyButton 
                productId={product.prodid} 
                initQuantity={initialQuantity}
              />
            </div>
          );
        })
      ) : (
        <div className="no-products">Товары не найдены</div>
      )}
    </div>
  );
}

