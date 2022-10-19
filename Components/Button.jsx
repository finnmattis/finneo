import styles from "../styles/Button.module.css"

export default function Button(props) {
    return (
        <div className={styles["button-container"]}>
            <div className={styles["wrap-button-container"]}>
                <button
                    className={styles.button}
                    onClick={props.func}
                    disabled={props.disabled}
                >
                    {props.name}
                </button>
                <div className={styles["button-bg"]}></div>
            </div>
        </div>
    )
}
