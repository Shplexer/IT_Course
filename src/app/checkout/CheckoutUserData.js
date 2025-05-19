"use client"

import { useState, useEffect, useRef } from 'react';
import styles from "./checkout.module.css";
import { handleOrderSubmission } from "../_lib/orders";
import { GetUserData } from '../_lib/users';
import { clearCart, getSessionCookie, getUserID } from '../_lib/cookies';
import { useRouter } from 'next/navigation';
export function UserDataForm({ onValidationChange, forceValidate, action, ref }) {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        phone: '',
        comment: ''
    });

    const [touchedFields, setTouchedFields] = useState({
        name: false,
        surname: false,
        email: false
    });
    const [loggedStatus, setLoggedStatus] = useState(false);

    const [forceValidation, setForceValidation] = useState(false);

    useEffect(() => {
        const checkIfLogged = async () => {
            try {
                const check = await getSessionCookie();
                if (check) {
                    setLoggedStatus(true);
                    const id = await getUserID();
                    console.log(id);
                    const userData = await GetUserData(id);
                    console.log(userData);

                    if (userData) {
                        setFormData({
                            name: userData.name || '',
                            surname: userData.surname || '',
                            patronymic: userData.patronymic || '',
                            email: userData.email || '',
                            phone: userData.phone || ''
                        });
                    } else {
                        console.error('User data not found');
                        // Handle case where userData is undefined
                    }
                } else {
                    setLoggedStatus(false);
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                // Handle error appropriately
            }
        };

        checkIfLogged();
    }, []);
    useEffect(() => {
        if (forceValidate) {
            // Mark all required fields as touched to show errors
            setTouchedFields({
                name: true,
                surname: true,
                email: true
            });
            setForceValidation(true);
        }
    }, [forceValidate]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    useEffect(() => {
        const isValid =
            formData.name.trim() !== '' &&
            formData.surname.trim() !== '' &&
            formData.email.trim() !== '' &&
            validateEmail(formData.email);
        onValidationChange(isValid);
    }, [formData, onValidationChange, forceValidation]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (!touchedFields[name]) {
            setTouchedFields(prev => ({
                ...prev,
                [name]: true
            }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const shouldShowError = (fieldName) => {
        const isTouched = forceValidation || touchedFields[fieldName];
        if (!isTouched) return false;

        if (fieldName === 'email') {
            return formData.email.trim() === '' || !validateEmail(formData.email);
        }
        return formData[fieldName].trim() === '';
    };

    return (
        <form action={action} ref={ref}>
            <h1>Данные заказчика</h1>
            <div className={styles["data-form"]}>
                <div className={styles["name"]}>
                    <p>Фамилия:</p>
                    <input
                        type="text"
                        name="surname"
                        placeholder="Фамилия"
                        className={`${styles["input"]} ${shouldShowError('surname') ? styles["error"] : ''} ${loggedStatus ? styles["uneditable"] : ''}`}
                        value={formData.surname}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        readOnly={loggedStatus}
                    />
                    {shouldShowError('surname') && <p className={styles["error-message"]}>Пожалуйста, введите фамилию</p>}

                    <p>Имя:</p>
                    <input
                        type="text"
                        name="name"
                        placeholder="Имя"
                        className={`${styles["input"]} ${shouldShowError('name') ? styles["error"] : ''} ${loggedStatus ? styles["uneditable"] : ''}`}
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        readOnly={loggedStatus}
                    />
                    {shouldShowError('name') && <p className={styles["error-message"]}>Пожалуйста, введите имя</p>}

                    <p>Отчество:</p>
                    <input
                        type="text"
                        name="patronymic"
                        placeholder="Отчество"
                        className={`${styles["input"]} ${loggedStatus ? styles["uneditable"] : ''}`}
                        value={formData.patronymic}
                        onChange={handleInputChange}
                        readOnly={loggedStatus}
                    />
                </div>
                <div className={styles["contact-info"]}>
                    <p>Телефон:</p>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Телефон"
                        className={`${styles["input"]} ${loggedStatus ? styles["uneditable"] : ''}`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        readOnly={loggedStatus}
                    />

                    <p>E-mail:</p>
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        className={`${styles["input"]} ${shouldShowError('email') ? styles["error"] : ''} ${loggedStatus ? styles["uneditable"] : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        readOnly={loggedStatus}
                    />
                    {shouldShowError('email') && <p className={styles["error-message"]}>Пожалуйста, введите корректный email</p>}

                    <p>Комментарий:</p>
                    <textarea
                        name="comment"
                        placeholder="Комментарий"
                        className={styles["text-area"]}
                        value={formData.comment}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
            </div>
        </form>
    );
}

export default function CheckoutButton({ total, products, action }) {
    const [isFormValid, setIsFormValid] = useState(false);
    const [forceValidate, setForceValidate] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);
    const formRef = useRef();
    const router = useRouter();

    const handleCheckout = async (e) => {
        e.preventDefault();
        setForceValidate(true);

        if (isFormValid) {
            console.log("Checkout proceeded");
            const formData = new FormData(formRef.current);
            try {
                const orderId = await handleOrderSubmission(formData);
                if (orderId) {
                    setOrderNumber(orderId);
                    setShowSuccess(true);
                }
            } catch (error) {
                console.error("Order submission failed:", error);
            }
        } else {
            console.log("checkOutFailed");
        }
    };

    return (
        <>
            <UserDataForm
                onValidationChange={setIsFormValid}
                forceValidate={forceValidate}
                ref={formRef}
                action={action}
            />
            {products.length !== 0 && (
                <div className={styles["order-summary"]}>
                    <p className={styles["final-price"]}>Итоговая сумма: {total} руб.</p>
                    <button
                        className={styles["checkout-button"]}
                        onClick={handleCheckout}
                        type="button"
                    >
                        Оформить заказ
                    </button>
                </div>
            )}
            {showSuccess && (
                <SuccessOverlay
                    orderNumber={orderNumber}
                    onClose={async () => {
                        setShowSuccess(false)
                        await clearCart();
                        router.push('/shop');
                        router.refresh();
                    }}
                />
            )}
        </>
    );
}

function SuccessOverlay({ orderNumber, onClose }) {
    return (
        <div className={styles.overlay}>
            <div className={styles.overlayContent}>
                <p>Заказ №{orderNumber} успешно оформлен!</p>
                <button onClick={onClose} className={styles.closeButton}>
                    Закрыть
                </button>
            </div>
        </div>
    );
}