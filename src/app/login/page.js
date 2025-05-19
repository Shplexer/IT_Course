"use client";

import { useEffect, useState } from 'react';
import styles from './loginOverlay.module.css';
import { checkLogin, registerUser } from '../_lib/users';
import { checkIfAdmin, createSessionCookie, getSessionCookie } from '../_lib/cookies';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isAdmin, setAdminStatus] = useState(false);
    const [isLoggedIn, setLoggedStatus] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const checkIfLogged = async () => {
            const check = await getSessionCookie();
            if (check) {
                setLoggedStatus(true);
            } else {
                setLoggedStatus(false);
            }
        };

        const checkAdmin = async () => {
            const isAdmin = await checkIfAdmin();
            setAdminStatus(isAdmin);
        };

        checkIfLogged();
        checkAdmin();
    }, [pathname, searchParams]);

    const toggleOverlay = () => {
        setIsOpen(!isOpen);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
        setSurname('');
        setPatronymic('');
        setPhone('');
        setIsRegisterMode(false);
    };

    const toggleRegisterMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
        setSurname('');
        setPatronymic('');
        setPhone('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Пожалуйста заполните все поля');
            return;
        }

        try {
            const token = await checkLogin(email, password);
            if (!token) {
                setError('Ошибка авторизации. Проверьте свой логин или пароль.');
                return;
            }

            setError('');
            await createSessionCookie(token);
            setAdminStatus(await checkIfAdmin());
            setLoggedStatus(true);
            toggleOverlay();
        } catch (err) {
            setError('Ошибка авторизации. Пожалуйста, попробуйте снова.');
            console.error("Login error:", err);
        }
    };

const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !surname) {
        setError('Пожалуйста заполните обязательные поля (имя, фамилия, email, пароль)');
        return;
    }

    try {
        const userData = {
            email,
            password,
            name,
            surname,
            patronymic: patronymic || null,
            phone: phone || null
        };

        const result = await registerUser(userData);
        
        // Check if the result has an error property
        if (result && result.error) {
            setError(result.error);
            return;
        }

        if (!result) {
            setError('Ошибка регистрации. Пожалуйста, попробуйте снова.');
            return;
        }

        setError('');
        await createSessionCookie(result); // result is the token in successful case
        setAdminStatus(await checkIfAdmin());
        setLoggedStatus(true);
        toggleOverlay();
    } catch (err) {
        setError('Ошибка регистрации. Пожалуйста, попробуйте снова.');
        console.error("Registration error:", err);
    }
};
    return (
        <>
            {isLoggedIn ? (
                <Link href='/userAccount'>
                    <button className={styles.openButton}>
                        Личный кабинет
                    </button>
                </Link>
            ) : (
                <button onClick={toggleOverlay} className={styles.openButton}>
                    Вход
                </button>
            )}

            {isOpen && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <button onClick={toggleOverlay} className={styles.closeButton}>
                            &times;
                        </button>

                        <h2 className={styles.overlayTitle}>
                            {isRegisterMode ? 'Регистрация' : 'Добро пожаловать'}
                        </h2>
                        <p className={styles.overlaySubtitle}>
                            {isRegisterMode ? 'Заполните данные для регистрации' : 'Введите авторизационные данные'}
                        </p>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <form className={styles.overlayForm}>
                            {isRegisterMode && (
                                <>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="name" className={styles.formLabel}>
                                            Имя:*
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="Введите имя"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="surname" className={styles.formLabel}>
                                            Фамилия:*
                                        </label>
                                        <input
                                            id="surname"
                                            name="surname"
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="Введите фамилию"
                                            value={surname}
                                            onChange={(e) => setSurname(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="patronymic" className={styles.formLabel}>
                                            Отчество:
                                        </label>
                                        <input
                                            id="patronymic"
                                            name="patronymic"
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="Введите отчество (если есть)"
                                            value={patronymic}
                                            onChange={(e) => setPatronymic(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone" className={styles.formLabel}>
                                            Телефон:
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className={styles.formInput}
                                            placeholder="Введите телефон"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.formLabel}>
                                    Электронная почта:*
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={styles.formInput}
                                    placeholder="Введите электронную почту"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password" className={styles.formLabel}>
                                    Пароль:*
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className={styles.formInput}
                                    placeholder="Введите пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className={styles.buttonGroup}>
                                <button
                                    type="submit"
                                    onClick={isRegisterMode ? handleRegister : handleLogin}
                                    className={styles.primaryButton}
                                >
                                    {isRegisterMode ? 'Зарегистрироваться' : 'Вход'}
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleRegisterMode}
                                    className={styles.secondaryButton}
                                >
                                    {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Регистрация'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}