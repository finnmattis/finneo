import styles from "../styles/Input.module.css"

export default function Input(props) {
    return (
        <label className={styles["text-box"]}>
            <input type="text" placeholder=" " onChange={props.func} />
            <span className={styles.placeholder}>{props.name}</span>
        </label>
    )
}
