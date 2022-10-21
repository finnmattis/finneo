import Image from "next/image"
import styles from "../styles/UploadFile.module.css"

export default function UploadFile({ name, accept, func }) {
    return (
        <>
            <label className={styles["file-input"]} htmlFor={name}>
                <div className={styles.wrapper}>
                    <Image src="/upload.png" layout="fill"></Image>
                </div>
                <p className={styles["file-input-text"]}>{name}</p>
            </label>
            <input
                id={name}
                className={styles.hidden}
                type="file"
                accept={accept}
                onChange={func}
            />
        </>
    )
}
