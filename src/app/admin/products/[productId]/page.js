"use server"
import { checkIfAdmin } from "@/app/_lib/cookies";
import { fetchProductById2, getTypes } from "@/app/_lib/products";
import { redirect } from "next/navigation";
import ProductPage from "./ProductEditor";

export default async function ProductEditPage({ params }) {
    const isAdmin = await checkIfAdmin();
    if (!isAdmin) {
        return redirect('/');
    }
    const productId = (await params).productId;
    let product = [{}];
    
    if(productId != "new"){
        product = await fetchProductById2(productId);
    }
    const productTypes = await getTypes();
    console.log(product)
    return (
        <ProductPage product={product} productTypes={productTypes} />
    );
}