import styles from "../styles/Button.module.css"

export default function Button({ name, func }) {
    return (
        <button onClick={func} className={styles.button}><p className={styles["button-text"]}>{name}</p></button>

    )
}
