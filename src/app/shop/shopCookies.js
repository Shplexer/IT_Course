// shop/shopCookies.js
'use server'
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers'

const CART_COOKIE_NAME = 'shop_cart';

export async function createCookie(product) {
    const productToSave = product.dataToSaveToCookies;
    const productId = productToSave.productId;
    const quantity = productToSave.quantity;

    const cookieStore = await cookies();
    const cart = await getCart();

    const existingProductIndex = cart.findIndex(item => item.productId === productId);

    if (existingProductIndex !== -1) {
        console.log(cart[existingProductIndex].quantity, quantity)
        if (cart[existingProductIndex].quantity !== quantity) {
            console.log('changed quantity');
            if(quantity === 0){
                cart.splice(existingProductIndex, 1);
            }
            else{
                cart[existingProductIndex].quantity = quantity;
            }
        }
    } else {
        cart.push({ productId, quantity });
    }

    cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), { maxAge: 60 * 60 * 24 * 7 });
    revalidatePath('/', 'layout');

    return { success: true };
}


export async function getCart() {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(CART_COOKIE_NAME);
    const cart = cartCookie ? JSON.parse(cartCookie.value) : [];
    console.log('got a cart!');
    console.log(cart);
    return cart;
}


