import { useState } from "react"
import styles from "../styles/Checkmark.module.css"

export default function Checkmark({ func }) {
    const [checked, setChecked] = useState(false)
    return (
        <label class={styles.root}>
            <p className={styles.text}>Show Password</p>
            <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                    setChecked(!checked)
                    func()
                }}
            />
            <span class={styles.checkmark}></span>
        </label>
    )
}
