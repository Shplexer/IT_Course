// shop/shopCookies.js
'use server'
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken";
import { redirect } from 'next/navigation';

const CART_COOKIE_NAME = process.env.CART_COOKIE_NAME;

export async function createSessionCookie(token) {
    const cookieStore = await cookies();
    const session = await getSessionCookie();
    if (session) {
        // console.log('session already exists');
        await clearSessionCookie();
    }
    // console.log("=============created cookie=================");
    // console.log(await token);
    //     console.log("=============created cookie=================");
    cookieStore.set(process.env.SESSION_COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: 'strict' });
    revalidatePath('/', 'layout');
}
export async function checkIfAdmin() {
    const session = await getSessionCookie();
    if (!session) {
        // console.log("no session")
        return false;
    }

    // console.log("=========checking if admin===========");
    // console.log("session", session)
    // console.log("Session value:", session.value);
    // console.log("Type of session value:", typeof session.value);
    try {
        // Assuming session.value contains a JWT token
        const decoded = jwt.verify(session.value, process.env.SECRET_TOKEN_JWT);
        // console.log(decoded.role === true);
        return decoded.role === true;
    } catch (error) {
        console.error("Error verifying token:", error);
        return false;
    }
}
export async function LogOut() {
    await clearSessionCookie();
    redirect('/');
}
export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(process.env.SESSION_COOKIE_NAME);
    revalidatePath('/', 'layout');
}

export async function getSessionCookie() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME);
    // const session = sessionCookie ? JSON.parse(sessionCookie.value) : [];
    // console.log('got a session cookie!');
    // console.log(sessionCookie);
    return sessionCookie;
}

export async function getUserID() {

    const cookie = await getSessionCookie();
    if (cookie) {
        // console.log("getting id backend")
        const decoded = jwt.verify(cookie.value, process.env.SECRET_TOKEN_JWT);
        // console.log(decoded);
        return decoded.userId;
    }
}

export async function addToCart(product) {
    const productToSave = product.dataToSaveToCookies;
    const productId = productToSave.productId;
    const quantity = productToSave.quantity;
    const unit_price = productToSave.unit_price;
    // console.log("adding to cart");
    // console.log("===========")
    // console.log(productToSave);
    // console.log("===========")

    const cookieStore = await cookies();
    const cart = await getCart();

    const existingProductIndex = cart.findIndex(item => item.productId === productId);

    if (existingProductIndex !== -1) {
        // console.log(cart[existingProductIndex].quantity, quantity)
        if (cart[existingProductIndex].quantity !== quantity) {
            // console.log('changed quantity');
            if (quantity === 0) {
                cart.splice(existingProductIndex, 1);
            }
            else {
                cart[existingProductIndex].quantity = quantity;
                cart[existingProductIndex].unit_price = unit_price;
            }
        }
    } else {
        cart.push({ productId, quantity, unit_price });
    }

    cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), { maxAge: 60 * 60 * 24 * 7 });
    revalidatePath('/', 'layout');

    return { success: true };
}

export async function removeFromCart(productId) {
    const cookieStore = await cookies();
    const cart = await getCart();
    const existingProductIndex = cart.findIndex(item => item.productId === productId);
    if (existingProductIndex !== -1) {
        cart.splice(existingProductIndex, 1);
    }
    cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), { maxAge: 60 * 60 * 24 * 7 });

}
export async function clearCart() {
    const cookieStore = await cookies();
    cookieStore.delete(process.env.CART_COOKIE_NAME);
    revalidatePath('/', 'layout');

}
export async function getCart() {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(CART_COOKIE_NAME);
    console.log("cc", cartCookie);
    let cart = [];
    if(cartCookie && cartCookie.value != ""){
        cart = cartCookie ? JSON.parse(cartCookie.value) : [];
    }
    // console.log('got a cart!');
    // console.log(cart);
    return cart;
}

