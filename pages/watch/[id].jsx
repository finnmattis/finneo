import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { firestore } from "../../lib/firebase"
import styles from "../../styles/WatchPage.module.css"

export default function WatchPage() {
    const router = useRouter()
    const { id } = router.query
    const [exists, setExists] = useState(true)
    const [url, setUrl] = useState(null)
    const [title, setTitle] = useState(null)
    const [desc, setDesc] = useState(null)
    const [username, setUsername] = useState(null)
    const [photoURL, setPhotoURL] = useState(null)

    const fetchData = async () => {
        if (id) {
            const videoQuerry = firestore
                .collectionGroup("uploads")
                .where("id", "==", id)
            let vidSnapshot = await videoQuerry.get()
            if (vidSnapshot.docs.length > 0) {
                let data = vidSnapshot.docs[0].data()
                setUrl(data.videoURL)
                setTitle(data.title)
                setDesc(data.description)
                const authorQuerry = firestore
                    .collection("users")
                    .doc(data.author)
                let authorSnapshot = await authorQuerry.get()
                setUsername(authorSnapshot.data().username)
                setPhotoURL(authorSnapshot.data().photoURL)
            } else {
                setExists(false)
            }
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    return (
        <div className={styles.root}>
            {exists ? (
                <div>
                    <video className={styles.video} src={url} controls={true} />
                    <div className={styles["info-container"]}>
                        <div className={styles["author-container"]}>
                            <div className={styles.profile}>
                                <Image
                                    src={photoURL ? photoURL : "/"}
                                    layout="fill"
                                />
                            </div>
                            <p className={styles.username}>{username}</p>
                        </div>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.desc}>{desc}</p>
                    </div>
                </div>
            ) : (
                <div className={styles["nothing-container"]}>
                    <p className={styles["nothing-text"]}>Nothing here!</p>
                </div>
            )}
        </div>
    )
}
