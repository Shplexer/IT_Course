'use server'
import Header from './HeaderClient';
import { getCart } from '../shop/shopCookies';

export default async function HeaderWrapper() {
  const cart = await getCart();
  return <Header numToDisplay={cart.length} />;
}