import styles from "../styles/Input.module.css"

export default function Input({ name, func }) {
    return (
        <div className={styles["text-box"]}>
            <span className={styles.name}>{name}</span>
            <input type="text" placeholder=" " onChange={func} />
        </div>
    )
}
