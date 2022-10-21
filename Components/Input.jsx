import styles from "../styles/Input.module.css"

export default function Input(props) {
    return (
        <div className={styles["text-box"]}>
            <span className={styles.name}>{props.name}</span>
            <input type="text" placeholder=" " onChange={props.func} />
        </div>
    )
}
