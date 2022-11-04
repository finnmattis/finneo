import styles from "../styles/Input.module.css"

export default function Input({ name, value, func, password }) {
    return (
        <div className={styles["text-box"]}>
            <span className={styles.name}>{name}</span>
            <input
                type={password ? "password" : "text"}
                placeholder=" "
                value={value}
                onChange={func}
            />
        </div>
    )
}
