"use server"
import connection from "@/app/_lib/db";
import { writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
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
  LEFT JOIN "types" ON products.typeid = "types".id
`;
const BASE_PRODUCT_QUERY2 = `
SELECT 
    products.id AS product_id,
    products.name, 
    products.description, 
    products.shortdescription as short_description,
    products.properties,
    products.price,
    products.isonsale as is_on_sale,
    products.saleprice,    
    products.amount,
    products.picId as pic_id,
    pictures.path as pic_path,
	types.id AS type_id,
    types.name AS product_type,
    product_type_attributes.attribute_name,
    product_attribute_values.value
FROM 
    products
LEFT JOIN 
    types ON products.typeid = types.id
INNER JOIN
	pictures ON products.picid = pictures.id
LEFT JOIN 
    product_type_attributes ON 
		products.typeid = product_type_attributes.product_type_id
LEFT JOIN 
    product_attribute_values ON
		products.id = product_attribute_values.product_id 
		AND product_type_attributes.id = product_attribute_values.attribute_id
`;
const SAVE_PRODUCT_QUERY = `
WITH image_insert AS (
  INSERT INTO pictures (path)
  SELECT $12::text
  WHERE $12 IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM pictures WHERE path = $12::text)
  RETURNING id, path
),
product_upsert AS (
  UPDATE products SET
    picid = COALESCE(
      (SELECT id FROM pictures WHERE path = $12::text),
      (SELECT id FROM image_insert)
    ),
    description = $2,
    typeid = $3,
    price = $4,
    properties = $5,
    isonsale = $6,
    saleprice = $7,
    shortdescription = $8,
    name = $9,
    amount = $10
  WHERE id = $1
  RETURNING id
),
new_product AS (
  INSERT INTO products (
    picid, description, typeid, price, properties, 
    isonsale, saleprice, shortdescription, name, amount, "isPromo"
  )
  SELECT
    COALESCE(
      (SELECT id FROM pictures WHERE path = $12),
      (SELECT id FROM image_insert)
    ),
    $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE
  WHERE NOT EXISTS (SELECT 1 FROM product_upsert)
  RETURNING id
),
combined_ids AS (
  SELECT id FROM product_upsert
  UNION ALL
  SELECT id FROM new_product
),
attribute_updates AS (
  DELETE FROM product_attribute_values
  WHERE product_id IN (SELECT id FROM combined_ids)
  AND attribute_id NOT IN (
    SELECT pta.id 
    FROM product_type_attributes pta
    JOIN jsonb_array_elements($11::jsonb) WITH ORDINALITY AS attr(data, ord) 
      ON pta.attribute_name = attr.data->>'name'
    WHERE pta.product_type_id = $3
  )
)
INSERT INTO product_attribute_values (product_id, attribute_id, value)
SELECT 
  c.id,
  pta.id,
  attr.data->>'value'
FROM 
  jsonb_array_elements($11::jsonb) WITH ORDINALITY AS attr(data, ord)
JOIN product_type_attributes pta 
  ON pta.attribute_name = attr.data->>'name' AND pta.product_type_id = $3
CROSS JOIN combined_ids c
ON CONFLICT (product_id, attribute_id) DO UPDATE SET
  value = EXCLUDED.value
`;

export async function uploadProductImage(imageFile) {
  try {
    if (!imageFile) {
      throw new Error('No file uploaded')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Только JPEG, PNG, and WebP файлы разрешены')
    }

    // Validate file size (5MB max)
    const maxSize = 10 * 1024 * 1024
    if (imageFile.size > maxSize) {
      throw new Error('Image size must be less than 10MB')
    }

    // Read the file buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside', // Maintain aspect ratio, ensure dimensions don't exceed 500px
        withoutEnlargement: true // Don't enlarge images smaller than 500px
      })
      .toBuffer()

    // Generate a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const extension = path.extname(imageFile.name)
    const filename = `${imageFile.name}`
    const filePath = path.join(process.cwd(), 'public', 'products', filename)

    // Write the processed image to the public/products directory
    await writeFile(filePath, processedImage)

    // Get the final dimensions for reference
    const metadata = await sharp(processedImage).metadata()

    return {
      success: true,
      picPath: filename,
      picUrl: `/products/${filename}`,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: error.message || 'Error uploading file'
    }
  }
}

export async function deleteProductImage(fileName) {
  try {
    if (!fileName) {
      throw new Error('No filename provided')
    }

    // Construct the full file path
    const filePath = path.join(process.cwd(), 'public', 'products', fileName)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch (err) {
      throw new Error('File not found')
    }

    // Delete the file
    await fs.unlink(filePath)

    return {
      success: true,
      message: `File ${fileName} deleted successfully`
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: error.message || 'Error deleting file'
    }
  }
}
async function executeQuery(query, params = []) {
  let client;
  try {
    client = await connection.connect();
    console.log("params:", params);
    const result = await client.query(query, params);
    console.log("ended");
    return result.rows;
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    if (client) client.release();
  }
}

export async function fetchProductById(productId) {
  const query = `${BASE_PRODUCT_QUERY} WHERE products.id = $1`;
  const results = await executeQuery(query, [productId]);
  return results[0] || null; // Return null instead of empty object if not found
}
export async function fetchProductById2(productId) {
  const query = `${BASE_PRODUCT_QUERY2} WHERE products.id = $1`;
  const results = await executeQuery(query, [productId]);

  if (results.length === 0) return null;

  // The first row contains all the product data
  const firstRow = results[0];

  // Parse properties if they're stored as JSON string
  const properties = typeof firstRow.properties === 'string'
    ? JSON.parse(firstRow.properties)
    : firstRow.properties || [];

  // Collect all unique attributes from all rows
  const attributesMap = new Map();
  results.forEach(row => {
    if (row.attribute_name && row.value) {
      attributesMap.set(row.attribute_name, row.value);
    }
    else if (!row.value && row.attribute_name) {
      attributesMap.set(row.attribute_name, "");
    }
  });

  // Convert to array of {name, value} objects
  const attributes = Array.from(attributesMap.entries()).map(([name, value]) => ({
    name,
    value
  }));

  return {
    ...firstRow,
    properties,
    attributes  // This will be an array of all attributes
  };
}
// Add this to products.js
export async function deleteProduct(productId) {
  const query = `DELETE FROM products WHERE id = $1 RETURNING id`;
  try {
    const result = await executeQuery(query, [productId]);
    return { success: result.length > 0 };
  } catch (err) {
    console.error("Database error:", err);
    return { success: false, error: err.message };
  }
}
export async function fetchProductsByFilters(filters) {
  let query = `
    SELECT 
      products.id as prodid,
      products.name,
      products.price,
      products.saleprice,
      products.isonsale,
      products.amount,
      pictures.path as picpath
    FROM products
    INNER JOIN pictures ON pictures.id = products.picid
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.search) {
    query += ` AND products.name ILIKE $${params.length + 1}
    `;
    params.push(`%${filters.search}%`);
  }
  
  if (filters.price_min && filters.price_max) {
    query += `AND (CASE WHEN products.isonsale = TRUE THEN products.saleprice ELSE products.price END) 
      BETWEEN $${params.length + 1} AND $${params.length + 2}
    `;
    params.push(filters.price_min, filters.price_max);
  }
  
  if (filters.type) {
    query += `
      AND products.typeid = $${params.length + 1}
    `;
    params.push(filters.type);
  }
  
  const attributeFilters = Object.entries(filters)
    .filter(([key]) => key.startsWith('attr_'))
    .reduce((acc, [key, value]) => {
      const attrId = key.replace('attr_', '');
      if (!acc[attrId]) acc[attrId] = [];
      acc[attrId].push(value);
      return acc;
    }, {});
  
  Object.entries(attributeFilters).forEach(([attrId, values], index) => {
    query += `
    AND products.id IN (
        SELECT product_id 
        FROM product_attribute_values
        WHERE attribute_id = $${params.length + 1}
        AND value = ANY($${params.length + 2}::text[])
      )
    `;
    params.push(attrId, values);
  });
  console.log(query);
  try {
    const result = await executeQuery(query, params);
    console.log(result);
    return result;
  } catch (err) {
    console.error("Error fetching filtered products:", err);
    return [];
  }
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
              LEFT JOIN "types" ON "types".id = products.typeid;
              `;
  return await executeQuery(query);
}

export async function getAttributesById(id) {
  const query = `
      SELECT *
      FROM product_type_attributes
      WHERE product_type_id = $1
    `;
  const result = await executeQuery(query, [id]);
  return result;
}
export async function getAttributesWithValues(params) {
  const query = `
    SELECT 
      pta.id as attribute_id,
      pta.attribute_name,
      pav.product_id,
      pta.product_type_id,
      pav.value
    FROM public.product_type_attributes pta
    INNER JOIN public.product_attribute_values pav ON pav.attribute_id = pta.id
  `;
  return await executeQuery(query);
}

export async function getAttributes() {
  const query = `SELECT * FROM product_type_attributes ORDER BY id ASC;`;
  return await executeQuery(query);
}
export async function createNewType(formData) {
  const query = `INSERT INTO types (name) VALUES ($1) RETURNING id, name;`;
  const result = await executeQuery(query, [formData.name]);
  return result[0];
}

export async function createNewAttribute(formData) {
  console.log(formData);
  const query = `INSERT INTO product_type_attributes (product_type_id, attribute_name) VALUES ($1, $2) RETURNING *;`;
  const result = await executeQuery(query, [formData.product_type_id, formData.attribute_name]);
  return result[0];
}

export async function updateType(id, formData) {
  const query = `UPDATE types SET name = $1 WHERE id = $2`;
  await executeQuery(query, [formData.name, id]);
}

export async function updateAttribute(id, formData) {
  const query = `UPDATE product_type_attributes SET attribute_name = $1, product_type_id = $2 WHERE id = $3`;
  await executeQuery(query, [formData.attribute_name, formData.product_type_id, id]);
}

export async function deleteTypeDB(id) {
  const query = `DELETE FROM types WHERE id = $1`;
  await executeQuery(query, [id]);
}

export async function deleteAttributeDB(id) {
  const query = `DELETE FROM product_type_attributes WHERE id = $1`;
  await executeQuery(query, [id]);
}

export async function getTypes() {
  const query = `SELECT * FROM types ORDER BY id ASC;`;
  return await executeQuery(query);
}
// In your saveProduct function
export async function saveProduct(productData) {
  const query = SAVE_PRODUCT_QUERY;
  const params = [
    productData.id || null, // $1
    productData.description, // $2
    productData.productType, // $3
    productData.price, // $4
    JSON.stringify(productData.properties), // $5
    productData.isOnSale, // $6
    productData.salePrice, // $7
    productData.shortDescription, // $8
    productData.name, // $9
    productData.amount, // $10
    JSON.stringify(productData.attributes), // $11
    productData.picPath // $12
  ];
  console.log(params);
  // console.log("===");
  // console.log(productData);
  const result = await executeQuery2(query, params);
  //return result.rows[0].id;
}

async function executeQuery2(query, params = []) {
  let client;
  try {
    client = await connection.connect();
    await client.query('BEGIN');
    const result = await client.query(query, params);
    await client.query('COMMIT');
    return result.rows;
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error("Database error:", err);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}