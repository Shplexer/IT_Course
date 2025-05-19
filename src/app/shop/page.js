// src/app/shop/page.js
"use server";
import { Filters, SearchBar } from "./ShopTools.js";
import ProductList from "./ProductList.js";
import connection from "../_lib/db.js";
import { getAttributesWithValues } from "../_lib/products.js";
import styles from "./shopNew.module.css"

export default async function Shop({ searchParams }) {
  let client;
  let prices = 0;
  let attributes = [];
  let types = [];
  const params = await searchParams;
  
  try {
    client = await connection.connect();
    
    // Get price range
    prices = await connection.query(`
      SELECT
        MIN(CASE WHEN products.isonsale= TRUE THEN products.saleprice ELSE price END) AS price_min,
        MAX(CASE WHEN products.isonsale = TRUE THEN products.saleprice ELSE price END) AS price_max
      FROM products;
    `);
    
    // Get attributes with values
    const attributesResult = await getAttributesWithValues();
    attributes = attributesResult;
    
    // Get all product types
    const typesResult = await connection.query('SELECT * FROM types ORDER BY name');
    types = typesResult.rows;
    
  } catch (err) {
    console.error("Error fetching data:", err);
    return <div>Ошибка загрузки данных</div>;
  } finally {
    if (client) {
      await client.release();
    }
    
    return (
      <div>
        <SearchBar />
        <div className={styles["shop-wrap"]}>
          <Filters 
            prices={prices.rows[0]} 
            attributes={attributes} 
            types={types} 
          />
          <ProductList filters={params.price_min ? params : prices.rows[0]} />
        </div>
      </div>
    );
  }
}