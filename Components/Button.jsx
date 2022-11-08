import styles from "../styles/Button.module.css"

export default function Button({ name, func, disabled }) {
    return (
        <button
            onClick={func}
            disabled={disabled}
            className={`${styles.button} ${disabled ? styles.disabled : ""}`}
        >
            <p className={styles["button-text"]}>{name}</p>
        </button>
    )
}
