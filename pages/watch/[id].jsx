import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    startAfter,
    updateDoc,
    where,
} from "firebase/firestore"
import debounce from "lodash.debounce"
import moment from "moment"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import CommentSection from "../../Components/CommentSection"
import Feed from "../../Components/Feed"
import RatingBar from "../../Components/RatingBar"
import Search from "../../Components/Search"
import { UserContext } from "../../lib/context"
import { auth, firestore, toJSON } from "../../lib/firebase"
import { useWindowDimensions } from "../../lib/hooks"
import styles from "../../styles/WatchPage.module.css"

const IN_LIMIT = 3
const LOAD_LIMIT = 4

export async function getServerSideProps(context) {
    const { id } = context.params
    let videoQuery = query(
        collectionGroup(firestore, "uploads"),
        where("id", "==", id)
    )
    let vidSnapshot = await getDocs(videoQuery)
    let vid = vidSnapshot.docs.map(toJSON)[0]
    if (!vid) {
        return {
            props: {
                exists: false,
            },
        }
    }
    const authorQuery = doc(firestore, "users", vid.author)
    let authorSnapshot = await getDoc(authorQuery)
    const uploadsQuery = query(
        collectionGroup(firestore, "uploads"),
        orderBy("createdAt", "desc"),
        limit(IN_LIMIT)
    )
    const uploads = (await getDocs(uploadsQuery)).docs.map(toJSON)
    let vidRef = vidSnapshot.docs[0].ref
    let commentQuery = query(
        collection(vidRef, "comments"),
        orderBy("createdAt", "desc"),
        limit(IN_LIMIT)
    )
    let comments = (await getDocs(commentQuery)).docs.map(toJSON)
    return {
        props: {
            exists: true,
            id,
            url: vid.videoURL,
            title: vid.title,
            author_username: authorSnapshot.data().username,
            photoURL: authorSnapshot.data().photoURL,
            desc: vid.description,
            createdAt: moment(vid.createdAt).fromNow(),
            views: vid.views,
            initialUploads: uploads,
            initialComments: comments,
        },
    }
}

export default function WatchPage({
    exists,
    id,
    url,
    title,
    author_username,
    photoURL,
    desc,
    createdAt,
    views,
    initialUploads,
    initialComments,
}) {
    //Need to fetch client side because firebase objects are not serializable
    const vidRef = useRef()
    let { width } = useWindowDimensions()

    const { user, username } = useContext(UserContext)
    const [like, setLike] = useState(false)
    const [dislike, setDislike] = useState(false)
    const [likes, setLikes] = useState(0)
    const [dislikes, setDislikes] = useState(0)
    const [percent, setPercent] = useState(0)

    const updatePercent = (numLikes, numDislikes) => {
        if (numLikes == 0) {
            setPercent(0)
        } else {
            setPercent((numLikes / (numLikes + numDislikes)) * 100)
        }
    }

    const getFeedQuery = (cursor, asc) => {
        return query(
            collectionGroup(firestore, "uploads"),
            orderBy("createdAt", asc ? "asc" : "desc"),
            startAfter(cursor),
            limit(IN_LIMIT)
        )
    }

    const getInFeedQuery = () => {
        return query(
            collectionGroup(firestore, "uploads"),
            orderBy("createdAt"),
            limit(IN_LIMIT)
        )
    }

    const getLikes = async () => {
        const unsub = auth.onAuthStateChanged(async (cur_user) => {
            unsub()
            let didLike = false
            let didDislike = false
            if (cur_user) {
                didLike = doc(vidRef.current, "likes", cur_user.uid)
                didLike = await getDoc(didLike)
                if (didLike.exists()) {
                    setLike(true)
                }
                didDislike = doc(vidRef.current, "dislikes", cur_user.uid)
                didDislike = await getDoc(didDislike)
                if (didDislike.exists()) {
                    setDislike(true)
                }
            }
            let numLikes = await getCountFromServer(
                collection(vidRef.current, "likes")
            )

            numLikes = numLikes.data().count

            let numDislikes = await getCountFromServer(
                collection(vidRef.current, "dislikes")
            )
            numDislikes = numDislikes.data().count

            if (cur_user) {
                setLikes(numLikes - didLike.exists() ? 1 : 0)
                setDislikes(numDislikes - didDislike.exists() ? 1 : 0)
            } else {
                setLikes(numLikes)
                setDislikes(numDislikes)
            }
            updatePercent(numLikes, numDislikes)
        })
    }

    const setVidQuery = async () => {
        const vidQuery = query(
            collectionGroup(firestore, "uploads"),
            where("id", "==", id)
        )
        vidRef.current = (await getDocs(vidQuery)).docs[0].ref
    }

    useEffect(() => {
        const setup = async () => {
            await setVidQuery()
            updateDoc(vidRef.current, {
                views: views + 1,
            })
            getLikes()
        }
        setup()
    }, [])

    const onLikeHelper = debounce(async () => {
        const likesRef = doc(vidRef.current, "likes", user.uid)
        if (like) {
            await deleteDoc(likesRef)
            updatePercent(likes, dislikes)
        } else {
            if (dislike) {
                const dislikesRef = doc(vidRef.current, "dislikes", user.uid)
                await deleteDoc(dislikesRef)
            }
            await setDoc(likesRef, {
                uid: user.uid,
            })
            updatePercent(likes + 1, dislikes)
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
        const dislikesRef = doc(vidRef.current, "dislikes", user.uid)
        if (dislike) {
            await deleteDoc(dislikesRef)
            updatePercent(likes, dislikes)
        } else {
            if (like) {
                const likesRef = doc(vidRef.current, "likes", user.uid)
                await deleteDoc(likesRef)
            }
            await setDoc(dislikesRef, {
                uid: user.uid,
            })
            updatePercent(likes, dislikes + 1)
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

    return (
        <div className={styles.root}>
            <div className={styles["search-container"]}>
                <Search />
            </div>
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
                                <RatingBar percent={percent} />
                            </div>
                            <p className={styles.title}>{title}</p>
                            <p className={styles.desc}>{desc}</p>
                            <p className={styles.views}>
                                Views {views} • {createdAt}
                            </p>
                        </div>
                        <CommentSection
                            initialComments={initialComments}
                            vidRef={vidRef.current}
                        />
                    </div>
                    <div className={styles["feed-container"]}>
                        <Feed
                            initialUploads={initialUploads}
                            widthNum={width && width < 1400 ? "95" : "28"}
                            queryFunc={getFeedQuery}
                            inQueryFunc={getInFeedQuery}
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
