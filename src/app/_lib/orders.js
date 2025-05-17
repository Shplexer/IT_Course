"use server"
import { revalidatePath } from "next/cache";
import { getCart } from "./cookies";
import connection from "./db"
import { sendOrderMail } from "./sendMail";

async function executeTransaction(email, orderItems, comment, name, phone) {
    const client = connection.connect();
    try {
        const userRes = await connection.query(`
            WITH find_user AS (
                SELECT user_id FROM users WHERE email = $1
            ),
            create_user AS (
                INSERT INTO users (username, email, phone, password, Name)
                SELECT 
                    'temp_' || substr(md5(random()::text), 1, 8),
                    $1,
                    $2,
                    substr(md5(random()::text), 1, 20),
                    $3
                WHERE NOT EXISTS (SELECT 1 FROM find_user)
                RETURNING user_id
            )
            SELECT user_id FROM find_user
            UNION ALL
            SELECT user_id FROM create_user
            LIMIT 1
        `, [email, phone, name]);

        const userId = userRes.rows[0]?.user_id;
        if (!userId) throw new Error('User resolution failed');

        // 2. Create order
        const orderRes = await connection.query(`
            INSERT INTO orders (user_id, order_date, status, payment_status, comment)
            VALUES ($1, NOW(), 'pending', 'unpaid', $2)
            RETURNING order_id
        `, [userId, comment]);

        const orderId = orderRes.rows[0]?.order_id;
        if (!orderId) throw new Error('Order creation failed');

        // 3. Insert items
        console.log(orderItems);
        console.log("!!!!!!!!");
        for (const item of orderItems) {
            await connection.query(`
                INSERT INTO order_items 
                (order_id, productId, quantity, unit_price)
                VALUES ($1, $2, $3, $4)
            `, [
                orderId,
                item.productId,
                item.quantity,
                item.unit_price
            ]);
        }
        return { orderId, userId };
    } catch (error) {
        error.isTransactionError = true;
        throw error;
    }
}

export async function handleOrderSubmission(formData) {
    // Get all form values
    console.log(formData);
    const cart = await getCart();
    const orderData = {
        customer: {
            name: formData.get('name'),
            surname: formData.get('surname'),
            patronymic: formData.get('patronymic'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            comment: formData.get('comment')
        },
        products: await cart
        // total: total
    };
    const name = `${formData.get('surname')} ${formData.get('name')} ${formData.get('patronymic')}`;

    console.log('Order data:', orderData);
    executeTransaction(formData.get('email'), await cart, formData.get('comment'), name, formData.get('phone'))
    sendOrderMail(formData.get('email'), orderData)
}

export async function getOrders() {
    try{

        connection.connect();
        const orders = await connection.query(`
            SELECT 
            order_items.order_id,
            order_date,
            status,
            payment_status,
            order_item_id,
            products."name" as "product_name",
            order_items.productid,
            quantity,
            unit_price,
            subtotal,
            comment,
            users.user_id,
            email,
            phone,
            users.name as "customer_name",
            surname as "customer_surname",
            patronymic as "customer_patronymic"
            
            FROM order_items
            INNER JOIN orders on orders.order_id = order_items.order_id
            INNER JOIN users on orders.user_id = users.user_id
            INNER JOIN products on products.id = order_items.productid;
            `);
            return orders.rows;
        }catch (error) {
            console.error(error);
        }

}

export async function ChangeOrderStatus(id, status) {
    connection.connect();
    console.log(`${id}: changed status to ${status}`)
    try {
        await connection.query(`
            UPDATE orders
            SET status = $1
            WHERE order_id = $2;
        `, [status, id]);
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error(error);
    }
}

export async function DeleteOrder(id) {
    connection.connect();
    try {
        await connection.query(`
            DELETE FROM orders
            WHERE order_id = $1;
        `, [id]);
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error(error);
    }
}