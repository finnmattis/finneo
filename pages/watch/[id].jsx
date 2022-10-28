import debounce from "lodash.debounce"
import moment from "moment"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import Feed from "../../Components/Feed"
import { UserContext } from "../../lib/context"
import { auth, firestore, toJSON } from "../../lib/firebase"
import { useWindowDimensions } from "../../lib/hooks"
import styles from "../../styles/WatchPage.module.css"

const IN_LIMIT = 3
const LOAD_LIMIT = 4

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
            views: vid.views,
            author_username: authorSnapshot.data().username,
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
    views,
    author_username,
    photoURL,
    exists,
}) {
    const { user, username } = useContext(UserContext)
    const vidQuery = firestore.collectionGroup("uploads").where("id", "==", id)
    const [like, setLike] = useState(false)
    const [dislike, setDislike] = useState(false)
    let { width } = useWindowDimensions()

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

    const increment_views = async () => {
        const video = (await vidQuery.get()).docs[0]
        const views = video.data().views + 1
        video.ref.update({ views })
    }

    useEffect(() => {
        increment_views()
        getLikes()
    }, [])

    const onLikeHelper = debounce(async () => {
        const vid = (await vidQuery.get()).docs[0].ref

        let likes = vid.collection("likes").doc(user.uid)
        if (!like) {
            if (dislike) {
                let dislikes = vid.collection("dislikes").doc(user.uid)
                dislikes.delete()
            }
            likes.set({
                uid: user.uid,
            })
        } else {
            likes.delete()
        }
    }, 500)

    const onLike = () => {
        if (author_username != username) {
            if (user) {
                setLike(!like)
                setDislike(false)
                onLikeHelper()
            } else {
                toast.error("Not logged in!")
            }
        } else {
            toast.error("Can't like your own video!")
        }
    }

    const onDislikeHelper = debounce(async () => {
        const vid = (await vidQuery.get()).docs[0].ref
        let dislikes = vid.collection("dislikes").doc(user.uid)
        if (!dislike) {
            if (like) {
                let likes = vid.collection("likes").doc(user.uid)
                likes.delete()
            }
            dislikes.set({
                uid: user.uid,
            })
        } else {
            dislikes.delete()
        }
    }, 500)

    const onDislike = async () => {
        if (author_username != username) {
            if (user) {
                setDislike(!dislike)
                setLike(false)
                onDislikeHelper()
            } else {
                toast.error("Not logged in!")
            }
        } else {
            toast.error("Can't dislike your own video!")
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
                                <Link href={`/users/${author_username}`}>
                                    <div className={styles.profile}>
                                        <Image
                                            src={photoURL ? photoURL : "/"}
                                            alt="profile"
                                            layout="fill"
                                        />
                                    </div>
                                </Link>
                                <p className={styles.username}>
                                    {author_username}
                                </p>
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
                                        alt="like"
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
                                        alt="dislike"
                                        height="30px"
                                        width="30px"
                                    ></Image>
                                </div>
                            </div>
                            <p className={styles.title}>{title}</p>
                            <p className={styles.desc}>{desc}</p>
                            <p className={styles.views}>
                                Views {views} • {createdAt}
                            </p>
                        </div>
                    </div>
                    <div className={styles["feed-container"]}>
                        <Feed
                            initial_uploads={initial_uploads}
                            width={width && width < 1400 ? "95" : "25"}
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
