"use server"

import { redirect } from "next/navigation";
import { checkIfAdmin, getSessionCookie } from "../_lib/cookies";
import { getOrders } from "../_lib/orders";
import { fetchProductToEdit, getAttributes, getTypes } from "../_lib/products";
import AdminOrders from "./AdminOrders";
import AdminProductControl from "./AdminProductControl";
import UserAccountForm from "./UserData";
import styles from "./userAccount.module.css";
import AdminTypesControl from "./AdminTypesControl";

export default async function UserAccount() {
    const session = await getSessionCookie();
    if (!session.value) {
        return redirect('/');
    }
    else {
        const isAdmin = await checkIfAdmin();
        const orders = await getOrders();

        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    status: order.status,
                    payment_status: order.payment_status,
                    user: {
                        user_id: order.user_id,
                        email: order.email,
                        phone: order.phone,
                        name: order.customer_name,
                        surname: order.customer_surname,
                        patronymic: order.customer_patronymic
                    },
                    items: []
                };
            }
            acc[order.order_id].items.push({
                order_item_id: order.order_item_id,
                product_name: order.product_name,
                productid: order.productid,
                quantity: order.quantity,
                unit_price: order.unit_price,
                subtotal: order.subtotal,
                comment: order.comment
            });
            return acc;
        }, {});

        const types = await getTypes();
        const typeAttribute = await getAttributes();
        const orderList = Object.values(groupedOrders);
        const products = await fetchProductToEdit();
        return (
            <div>
                <UserAccountForm />
                {isAdmin &&
                    <div className={styles["admin-area"]}>
                        <AdminOrders orderList={orderList} />
                        <AdminTypesControl initialAttributes={typeAttribute} initialTypes={types} />
                        <AdminProductControl products={products} />
                    </div>
                }
            </div>
        );
    }
}