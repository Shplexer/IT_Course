"use client";

import { useEffect, useState } from 'react';
import styles from './loginOverlay.module.css';
import { checkLogin } from '../_lib/users';
import { checkIfAdmin, createSessionCookie, getSessionCookie } from '../_lib/cookies';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
export default function LoginOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAdmin, setAdminStatus] = useState(false);
    const [istLoggedIn, setLoggedStatus] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {
        const checkIfLogged = async () => {
            const check = await getSessionCookie();
            console.log("check");

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
    };

    const handleLogin = async (e) => { // Make this async
        e.preventDefault();
        if (!email || !password) {
            setError('Пожалуйста заполните все поля');
            return;
        }

        try {
            const token = await checkLogin(email, password); // Await the token
            if (!token) {
                setError('Ошибка авторизации. Проверьте свой логин или пароль.');
                return;
            }

            setError('');
            await createSessionCookie(token); // Await cookie creation
            // console.log(`==============isadmin=================`);
            // console.log(await checkIfAdmin()); // Await admin check
            setAdminStatus(await checkIfAdmin());
            setLoggedStatus(true);
            // console.log(`==============isadmin=================`);
            toggleOverlay();
        } catch (err) {
            setError('Ошибка авторизации. Пожалуйста, попробуйте снова.');
            console.error("Login error:", err);
        }
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Пожалуйста заполните все поля');
            return;
        }
        console.log('Sign up with:', email, password);
        setError('');
        toggleOverlay();
    };

    return (
        <>
            {istLoggedIn ? (
                <Link href='/userAccount'>

                    <button className={styles.openButton}>
                        Личный кабинет
                    </button>
                </Link>
            ) : (
                <button onClick={toggleOverlay} className={styles.openButton}>
                    Вход
                </button>
            )
            }


            {isOpen && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <button onClick={toggleOverlay} className={styles.closeButton}>
                            &times;
                        </button>

                        <h2 className={styles.overlayTitle}>Добро пожаловать</h2>
                        <p className={styles.overlaySubtitle}>Введите авторизационные данные</p>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <form className={styles.overlayForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.formLabel}>
                                    Электронная почта:
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
                                    Пароль
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
                                    onClick={handleLogin}
                                    className={styles.primaryButton}
                                >
                                    Вход
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSignUp}
                                    className={styles.secondaryButton}
                                >
                                    Регистрация
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}