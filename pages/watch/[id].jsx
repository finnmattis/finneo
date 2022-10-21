import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Feed from "../../Components/Feed"
import { firestore, toJSON } from "../../lib/firebase"
import styles from "../../styles/WatchPage.module.css"

const LIMIT = 3

export async function getServerSideProps(context) {
    const { id } = context.params

    const videoQuerry = firestore
        .collectionGroup("uploads")
        .where("id", "==", id)
    let vidSnapshot = await videoQuerry.get()
    if (vidSnapshot.empty) {
        return {
            props: {
                empty: true,
            },
        }
    }
    let vid = vidSnapshot.docs[0].data()
    const authorQuerry = firestore.collection("users").doc(vid.author)
    let authorSnapshot = await authorQuerry.get()

    const uploadsQuerry = firestore
        .collectionGroup("uploads")
        .orderBy("createdAt", "desc")
        .limit(LIMIT)
    const uploads = (await uploadsQuerry.get()).docs.map(toJSON)

    return {
        props: {
            uploads,
            url: vid.videoURL,
            title: vid.title,
            desc: vid.description,
            username: authorSnapshot.data().username,
            photoURL: authorSnapshot.data().photoURL,
            exists: true,
        },
    }
}

export default function WatchPage({
    uploads,
    url,
    title,
    desc,
    username,
    photoURL,
    exists,
}) {
    return (
        <div className={styles.root}>
            {exists ? (
                <div className={styles["watch-container"]}>
                    <div className={styles["vid-container"]}>
                        <video
                            className={styles.video}
                            src={url}
                            controls={true}
                        />
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
                    <div className={styles["feed-container"]}>
                        <Feed initial_uploads={uploads} width="25" />
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
