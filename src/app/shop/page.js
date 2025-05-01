// src/app/shop/page.js
"use server";

//import { useState } from "react";
import { Filters, SearchBar } from "./ShopTools.js";
import ProductList from "./ProductList.js";
import connection from "../lib/db.js";
import { getCart } from "./shopCookies.js";
import "./shopNew.css"
export default async function Shop({ searchParams }) {
        let client;
        let prices = 0;
        console.log(await getCart());
        try {
            //get max and min price from products
            client = await connection.connect();
            prices = await connection.query(`
                SELECT
                    MIN(CASE WHEN products.isonsale= TRUE THEN products.saleprice ELSE price END) AS price_min,
                    MAX(CASE WHEN products.isonsale = TRUE THEN products.saleprice ELSE price END) AS price_max
                FROM products;
            `);
        } catch (err) {
            console.error("Error fetching products:", err);
            return [];
        } finally {
            if (client) {
                await client.release();

            }
            return (
                <div>
                    
                    <SearchBar />
                    <div className="shop-wrap">
                        <Filters prices={prices.rows[0]} />
                        
                        {(await searchParams).price_min ? <ProductList filters={await searchParams} /> : <ProductList filters={prices.rows[0]} />  }
                    </div>
                </div>
            );
        }
}