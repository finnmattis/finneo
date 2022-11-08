import Image from "next/image"
import { useRef } from "react"
import styles from "../styles/UploadFile.module.css"

export default function UploadFile({ name, accept, func }) {
    const ref = useRef()
    return (
        <>
            <label className={styles["file-input"]} htmlFor={name}>
                <div className={styles.wrapper}>
                    <Image src="/upload.png" alt="upload" layout="fill"></Image>
                </div>
                <p className={styles["file-input-text"]}>{name}</p>
            </label>
            <input
                id={name}
                className={styles.hidden}
                type="file"
                ref={ref}
                accept={accept}
                // This is needed for videoes so that you can change the submition
                onClick={(e) => (e.target.value = null)}
                onChange={func}
            />
        </>
    )
}
