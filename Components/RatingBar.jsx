import styles from "../styles/RatingBar.module.css"

export default function RatingBar({ percent }) {
    return (
        <div className={styles.container}>
            <div
                style={{ width: `${percent}%` }}
                className={styles.filler}
            ></div>
        </div>
    )
}
