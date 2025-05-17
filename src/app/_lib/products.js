import connection from "@/app/_lib/db";

// Common base query to avoid repetition
const BASE_PRODUCT_QUERY = `
  SELECT
    products.id as prodId,
    products.name, 
    products.description,
    products.shortdescription as short_description,
    "types".name as typeName,
    products.properties,
    products.price,
    products.isonsale,
    products.saleprice,
    products.amount,
    products.picId,
    pictures.path as picPath
  FROM products
  INNER JOIN pictures ON products.picid = pictures.id
  INNER JOIN "types" ON products.typeid = "types".id
`;

// Helper function to handle database operations
async function executeQuery(query, params = []) {
  let client;
  try {
    client = await connection.connect();
    const result = await connection.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Database error:", err);
    return [];
  } finally {
    if (client) {
      await client.release();
    }
  }
}

export async function fetchProductById(productId) {
  const query = `${BASE_PRODUCT_QUERY} WHERE products.id = $1`;
  const results = await executeQuery(query, [productId]);
  return results[0] || null; // Return null instead of empty object if not found
}

export async function fetchProductsByFilters(filters) {
  const query = `
    ${BASE_PRODUCT_QUERY}
    WHERE (CASE WHEN products.isonsale = TRUE THEN products.saleprice 
          ELSE products.price END) BETWEEN $1 AND $2
  `;
  return await executeQuery(query, [filters.price_min, filters.price_max]);
}

export async function fetchProductsByIDs(productIds) {
  const query = `
    ${BASE_PRODUCT_QUERY}
    WHERE products.id = ANY($1::int[])
  `;
  return await executeQuery(query, [productIds]);
}

export async function fetchProductToEdit() {
  const query = `SELECT products.id,
                products.name as "product_name",
                price,
                isonsale as "is_on_sale",
                saleprice as "sale_price",
                amount as "available_amount",
                pictures."path" "path_to_pic",
                types."name" as "type_name",
                products."isPromo" AS "is_promo"
              FROM products
              INNER JOIN pictures ON pictures.id = products.picid
              INNER JOIN "types" ON "types".id = products.typeid;
              `;
  return await executeQuery(query);
}
