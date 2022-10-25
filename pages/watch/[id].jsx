import moment from "moment"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import Feed from "../../Components/Feed"
import { UserContext } from "../../lib/context"
import { auth, firestore, onAuthChange, toJSON } from "../../lib/firebase"
import styles from "../../styles/WatchPage.module.css"

const IN_LIMIT = 3
const LOAD_LIMIT = 1

export async function getServerSideProps(context) {
    const { id } = context.params

    const videoQuery = firestore
        .collectionGroup("uploads")
        .where("id", "==", id)
    let vidSnapshot = (await videoQuery.get()).docs.map(toJSON)
    if (vidSnapshot.empty) {
        return {
            props: {
                empty: true,
            },
        }
    }
    let vid = vidSnapshot[0]
    const authorQuery = firestore.collection("users").doc(vid.author)
    let authorSnapshot = await authorQuery.get()

    const uploadsQuery = firestore
        .collectionGroup("uploads")
        .orderBy("createdAt", "desc")
        .limit(IN_LIMIT)
    const uploads = (await uploadsQuery.get()).docs.map(toJSON)

    return {
        props: {
            initial_uploads: uploads,
            id: id,
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
    id,
    url,
    title,
    desc,
    createdAt,
    username,
    photoURL,
    exists,
}) {
    const { user } = useContext(UserContext)
    const vidQuery = firestore.collectionGroup("uploads").where("id", "==", id)
    const [like, setLike] = useState(false)
    const [dislike, setDislike] = useState(false)

    const getLikes = async () => {
        const unsub = auth.onAuthStateChanged(async (cur_user) => {
            unsub()
            if (cur_user) {
                let likes = (await vidQuery.get()).docs[0].ref
                    .collection("likes")
                    .doc(cur_user.uid)
                likes = await likes.get()
                if (likes.exists) {
                    setLike(true)
                }
                let dislikes = (await vidQuery.get()).docs[0].ref
                    .collection("dislikes")
                    .doc(cur_user.uid)
                dislikes = await dislikes.get()
                if (dislikes.exists) {
                    setDislike(true)
                }
            }
        })
    }

    useEffect(() => {
        getLikes()
    }, [])

    const onLike = async () => {
        const vid = (await vidQuery.get()).docs[0].ref
        setLike(!like)

        let likes = vid.collection("likes").doc(user.uid)
        if (!like) {
            likes.set({
                uid: user.uid,
            })
        } else {
            likes.delete()
        }
        if (dislike) {
            setDislike(false)
            let dislikes = vid.collection("dislikes").doc(user.uid)
            dislikes.delete()
        }
    }

    const onDislike = async () => {
        const vid = (await vidQuery.get()).docs[0].ref
        setDislike(!dislike)

        let dislikes = vid.collection("dislikes").doc(user.uid)
        if (!dislike) {
            dislikes.set({
                uid: user.uid,
            })
        } else {
            dislikes.delete()
        }
        if (like) {
            setLike(false)
            let likes = vid.collection("likes").doc(user.uid)
            likes.delete()
        }
    }

    const getQuery = (cursor) => {
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
                                <div
                                    className={styles["like-container"]}
                                    onClick={onLike}
                                >
                                    <Image
                                        src={
                                            like
                                                ? "/like-active.png"
                                                : "/like.png"
                                        }
                                        height="30px"
                                        width="30px"
                                    ></Image>
                                </div>
                                <div
                                    className={styles["like-container"]}
                                    onClick={onDislike}
                                >
                                    <Image
                                        src={
                                            dislike
                                                ? "/dislike-active.png"
                                                : "/dislike.png"
                                        }
                                        height="30px"
                                        width="30px"
                                    ></Image>
                                </div>
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
                            query_func={getQuery}
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
