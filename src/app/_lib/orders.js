"use server"
import { revalidatePath } from "next/cache";
import { getCart } from "./cookies";
import connection from "./db"
import { sendOrderMail, sendRegisteredUserData } from "./sendMail";

async function executeTransaction(email, orderItems, comment, name, phone) {
    const client = connection.connect();
    try {
        const userRes = await connection.query(`
            WITH find_user AS (
                SELECT user_id, NULL as temp_password FROM users WHERE email = $1
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
                RETURNING user_id, password as temp_password
            )
            SELECT user_id, temp_password FROM find_user
            UNION ALL
            SELECT user_id, temp_password FROM create_user
            LIMIT 1
        `, [email, phone, name]);

        const userId = userRes.rows[0]?.user_id;
        const tempPassword = userRes.rows[0]?.temp_password; // This will be null for existing users
        if (!userId) throw new Error('User resolution failed');

        const orderRes = await connection.query(`
            INSERT INTO orders (user_id, order_date, status, payment_status, comment)
            VALUES ($1, NOW(), 'pending', 'unpaid', $2)
            RETURNING order_id
        `, [userId, comment]);

        const orderId = orderRes.rows[0]?.order_id;
        if (!orderId) throw new Error('Order creation failed');

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
        
        return {
            orderId,
            tempPassword, // Will be null if user already existed
            isNewUser: tempPassword !== null // Flag indicating if this is a new user
        };
    } catch (error) {
        error.isTransactionError = true;
        throw error;
    }
}

export async function handleOrderSubmission(formData) {
    // Get all form values
    console.log(formData);
    const cart = await getCart();
    const name = `${formData.get('surname')} ${formData.get('name')} ${formData.get('patronymic')}`;
    const { orderId, tempPassword, isNewUser } = await executeTransaction(
        formData.get('email'), 
        await cart, 
        formData.get('comment'), 
        name, 
        formData.get('phone')
    );
    
    const orderData = {
        customer: {
            name: formData.get('name'),
            surname: formData.get('surname'),
            patronymic: formData.get('patronymic'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            comment: formData.get('comment'),
        },
        orderId: orderId,
        products: await cart
        // total: total
    };

    console.log('Order data:', orderData);
    sendOrderMail(formData.get('email'), orderData);
    if(isNewUser){
        sendRegisteredUserData(formData.get('email'), tempPassword)
    }
    return orderId;
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
    // await connection.connect();
    console.log(`${id}: changed status to ${status}`)
    try {
        await connection.query(`
            UPDATE orders
            SET status = $1
            WHERE order_id = $2;
        `, [status, id]);
        //revalidatePath('/', 'layout');
    } catch (error) {
        console.error(error);
    }
}

export async function DeleteOrder(id) {
    // await connection.connect();
    try {
        console.log('deleted');
        await connection.query(`
            DELETE FROM orders
            WHERE order_id = $1;
        `, [id]);
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error(error);
    }
}