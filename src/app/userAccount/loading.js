import styles from "./loading.module.css"
export default function Loading() {
    return (
        <div className={styles["loading-spinner"]}>
            <div className={styles["spinner"]}></div>
            <p>Загузка...</p>
        </div>
    );
}