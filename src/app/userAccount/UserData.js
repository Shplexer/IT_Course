"use client"
import { useEffect, useState } from "react";
import { getSessionCookie, getUserID, clearSessionCookie, LogOut } from "../_lib/cookies";
import { useRouter } from "next/navigation";
import styles from './userAccount.module.css'; // New CSS module for this component
import { GetUserData, UpdateUserData } from "../_lib/users";

export default function UserAccountForm() {
    const [isLoggedIn, setLoggedStatus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        phone: '',
    });

    const [touchedFields, setTouchedFields] = useState({
        name: false,
        surname: false,
        email: false,
        phone: false
    });

    const [forceValidation, setForceValidation] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        if (!phone) return true; // phone is optional
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.surname.trim() !== '' &&
            formData.email.trim() !== '' &&
            validateEmail(formData.email) &&
            validatePhone(formData.phone)
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (submitSuccess) setSubmitSuccess(false);
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

        if (fieldName === 'phone') {
            return formData.phone.trim() !== '' && !validatePhone(formData.phone);
        }

        return formData[fieldName].trim() === '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setForceValidation(true);
        setSubmitError('');

        if (!isFormValid()) {
            setSubmitError('Пожалуйста, заполните все обязательные поля корректно');
            return;
        }

        setIsSubmitting(true);

        try {
            const id = await getUserID();
            const userData = {
                name: formData.name,
                surname: formData.surname,
                patronymic: formData.patronymic,
                email: formData.email,
                phone: formData.phone,
            };
            await UpdateUserData(id, userData);

            setSubmitSuccess(true);
            setForceValidation(false);
        } catch (error) {
            setSubmitError(error.message || 'Произошла ошибка при обновлении данных');
        } finally {
            setIsSubmitting(false);
        }
    };
    const router = useRouter();
    const handleExit = async (e) => {
        e.preventDefault();
        try {
            await clearSessionCookie();
            setLoggedStatus(false);
        } finally {
            router.push('/');
            router.refresh();
        }
    };

    useEffect(() => {
        const checkIfLogged = async () => {
            try {
                const check = await getSessionCookie();
                if (check) {
                    const id = await getUserID();
                    setLoggedStatus(true);
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

    if (!isLoggedIn) {
        return <div className={styles.emptyOrderMessage}>Пожалуйста, войдите в систему для доступа к личному кабинету</div>;
    }
    return (
        <div className={styles.userAccountContainer}>
            <h1 className={styles.pageTitle}>Личный кабинет</h1>

            {submitSuccess && (
                <div className={styles.successMessage}>
                    Данные успешно обновлены!
                </div>
            )}

            {submitError && (
                <div className={styles.errorMessage}>
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.userForm}>
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Основная информация</h2>
                    <div className={styles.formGroup}>
                        <label htmlFor="surname" className={styles.formLabel}>
                            Фамилия
                        </label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.formInput} ${shouldShowError('surname') ? styles.inputError : ''}`}
                        />
                        {shouldShowError('surname') && (
                            <p className={styles.validationError}>Пожалуйста, введите фамилию</p>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.formLabel}>
                            Имя
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.formInput} ${shouldShowError('name') ? styles.inputError : ''}`}
                        />
                        {shouldShowError('name') && (
                            <p className={styles.validationError}>Пожалуйста, введите имя</p>
                        )}
                    </div>


                    <div className={styles.formGroup}>
                        <label htmlFor="patronymic" className={styles.formLabel}>
                            Отчество
                        </label>
                        <input
                            type="text"
                            id="patronymic"
                            name="patronymic"
                            value={formData.patronymic}
                            onChange={handleInputChange}
                            className={styles.formInput}
                        />
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Контактные данные</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            Email*
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.formInput} ${shouldShowError('email') ? styles.inputError : ''}`}
                        />
                        {shouldShowError('email') && (
                            <p className={styles.validationError}>
                                {formData.email.trim() === ''
                                    ? 'Пожалуйста, введите email'
                                    : 'Пожалуйста, введите корректный email'}
                            </p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone" className={styles.formLabel}>
                            Телефон
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.formInput} ${shouldShowError('phone') ? styles.inputError : ''}`}
                            placeholder="+79991234567"
                        />
                        {shouldShowError('phone') && (
                            <p className={styles.validationError}>Пожалуйста, введите корректный номер телефона</p>
                        )}
                    </div>
                </div>
                <div className={styles.buttonContainer}>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitButton}
                    >
                        {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    <button
                        className={styles.exitButton}
                        type="button"
                        onClick={handleExit}
                    >
                        Выйти из аккаунта
                    </button>
                </div>
            </form>
        </div>
    );
}