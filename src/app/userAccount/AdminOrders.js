"use client"
import { useState } from "react";
import { ChangeOrderStatus, DeleteOrder } from "../_lib/orders";
import styles from "./userAccount.module.css";
export default function AdminOrders({ orderList: initialOrderList }) {
    const [orders, setOrders] = useState(initialOrderList);
    const [processing, setProcessing] = useState(null); // track which order is being processed

    const handleCompleteOrder = async (id) => {
        setProcessing(id);
        setOrders(prev => prev.map(order =>
            order.order_id === id ? { ...order, status: 'completed' } : order
        ));
        await ChangeOrderStatus(id, 'completed');
        setProcessing(null);
    }

    const handleCancelOrder = async (id) => {
        setProcessing(id);
        setOrders(prev => prev.map(order =>
            order.order_id === id ? { ...order, status: 'cancelled' } : order
        ));
        await ChangeOrderStatus(id, 'cancelled');
        setProcessing(null);
    }

    const handleDeleteOrder = async (id) => {
        setProcessing(id);
        await DeleteOrder(id);
        setOrders(prev => prev.filter(order => order.order_id !== id));
        setProcessing(null);
    }
    const [hideCompleted, setHideCompleted] = useState(false);

    return (
        <div className={styles["pending-orders"]}>
            <h2>Заказы:</h2>
            <div className={styles.checkboxContainer}>
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={hideCompleted}
                    onChange={() => setHideCompleted(!hideCompleted)}
                />
                <span className={styles["checkbox-label"]}>Спрятать завершенные заказы</span>
            </div>
            <div className={styles["orders-table-container"]}>
                <table className={styles["orders-table"]}>
                    <thead>
                        <tr>
                            <th>ID заказа</th>
                            <th>Дата</th>
                            <th>Клиент</th>
                            <th>Контакты</th>
                            <th>Товары</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Оплата</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            if (hideCompleted && order.status != 'pending') return null;
                            return (
                                <tr key={order.order_id}>
                                    <td>{order.order_id}</td>
                                    <td>{new Date(order.order_date).toLocaleString('ru-RU')}</td>
                                    <td>
                                        {order.user.surname} {order.user.name} {order.user.patronymic}
                                    </td>
                                    <td>
                                        <div>{order.user.email}</div>
                                        <div>{order.user.phone}</div>
                                    </td>
                                    <td>
                                        <div className={styles["order-items"]}>
                                            {order.items.map((item) => (
                                                <div key={item.order_item_id} className={styles["order-item"]}>
                                                    {item.product_name} (#{item.productid}) × {item.quantity} шт. = {item.subtotal} руб.
                                                    {item.comment && <div className={styles["item-comment"]}>Примечание: {item.comment}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        {order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)} руб.
                                    </td>
                                    <td>
                                        <span className={`${styles["status-badge"]} ${styles[order.status]}`}>
                                            {order.status === 'pending' ? 'В обработке' :
                                                order.status === 'completed' ? 'Завершен' :
                                                    order.status === 'cancelled' ? 'Отменен' : order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles["status-badge"]} ${styles[order.payment_status]}`}>
                                            {order.payment_status === 'paid' ? 'Оплачен' : 'Не оплачен'}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            {order.status === ('pending') &&
                                                <button
                                                    name="action"
                                                    value="complete"
                                                    className={styles["action-button"]}
                                                    onClick={() => handleCompleteOrder(order.order_id)}
                                                    disabled={processing === order.order_id}
                                                >
                                                    Завершить
                                                </button>
                                            }
                                            {order.status === ('pending') &&
                                                <button
                                                    name="action"
                                                    value="cancel"
                                                    className={styles["action-button"]}
                                                    onClick={() => handleCancelOrder(order.order_id)}
                                                    disabled={processing === order.order_id}
                                                >
                                                    Отменить
                                                </button>
                                            }
                                            {order.status !== 'pending' &&
                                                <button
                                                    name="action"
                                                    value="delete"
                                                    className={styles["action-button"]}
                                                    onClick={() => handleDeleteOrder(order.order_id)}
                                                    disabled={processing === order.order_id}
                                                >
                                                    Удалить
                                                </button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}