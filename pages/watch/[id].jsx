import moment from "moment"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import Feed from "../../Components/Feed"
import { firestore, fromMillis, toJSON } from "../../lib/firebase"
import styles from "../../styles/WatchPage.module.css"

const IN_LIMIT = 3
const LOAD_LIMIT = 1

export async function getServerSideProps(context) {
    const { id } = context.params

    const videoQuerry = firestore
        .collectionGroup("uploads")
        .where("id", "==", id)
    let vidSnapshot = (await videoQuerry.get()).docs.map(toJSON)
    if (vidSnapshot.empty) {
        return {
            props: {
                empty: true,
            },
        }
    }
    let vid = vidSnapshot[0]
    const authorQuerry = firestore.collection("users").doc(vid.author)
    let authorSnapshot = await authorQuerry.get()

    const uploadsQuerry = firestore
        .collectionGroup("uploads")
        .orderBy("createdAt", "desc")
        .limit(IN_LIMIT)
    const uploads = (await uploadsQuerry.get()).docs.map(toJSON)

    return {
        props: {
            initial_uploads: uploads,
            url: vid.videoURL,
            title: vid.title,
            desc: vid.description,
            createdAt: moment(vid.createdAt).fromNow(),
            username: authorSnapshot.data().username,
            photoURL: authorSnapshot.data().photoURL,
            exists: true,
        },
    }
}

export default function WatchPage({
    initial_uploads,
    url,
    title,
    desc,
    createdAt,
    username,
    photoURL,
    exists,
}) {
    const getQuerry = (cursor) => {
        return firestore
            .collectionGroup("uploads")
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(LOAD_LIMIT)
    }

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
                                <Link href={`/users/${username}`}>
                                    <div className={styles.profile}>
                                        <Image
                                            src={photoURL ? photoURL : "/"}
                                            layout="fill"
                                        />
                                    </div>
                                </Link>
                                <p className={styles.username}>{username}</p>
                            </div>
                            <p className={styles.title}>{title}</p>
                            <p className={styles.date}>Uploaded {createdAt}</p>
                            <p className={styles.desc}>{desc}</p>
                        </div>
                    </div>
                    <div className={styles["feed-container"]}>
                        <Feed
                            initial_uploads={initial_uploads}
                            width="25"
                            querry_func={getQuerry}
                        />
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
