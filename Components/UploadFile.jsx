import Image from "next/image";
import styles from "../styles/UploadFile.module.css";

export default function UploadFile({ name, func }) {
    return (
        <>
            <label className={styles["file-input"]} htmlFor="video-input">
                <div className={styles.wrapper}>
                    <Image src="/upload.png" layout="fill"></Image>
                </div>
                <p className={styles["file-input-text"]}>{name}</p>
            </label>
            <input
                id="video-input"
                className={styles.hidden}
                type="file"
                accept="image/png, image/jpeg"
                onChange={func}
            />
        </>

    )
}
