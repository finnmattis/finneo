import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    startAfter,
    Timestamp,
} from "firebase/firestore"
import moment from "moment"
import Image from "next/image"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import Button from "../Components/Button"
import Input from "../Components/Input"
import { UserContext } from "../lib/context"
import { toJSON } from "../lib/firebase"
import styles from "../styles/CommentSection.module.css"

function Comment({ comment, createdAt, photoURL, username }) {
    return (
        <div className={styles["comment-container"]}>
            <div className={styles.profile}>
                <Image src={photoURL} layout="fill" />
            </div>
            <p className={styles["username-text"]}>{username}</p>
            <p className={styles["comment-text"]}>{comment}</p>
            <p className={styles["date-text"]}>{createdAt}</p>
        </div>
    )
}

export default function CommentSection({ initialComments, vidRef }) {
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState(initialComments)
    const [end, setEnd] = useState(false)
    const { username, profilePicture } = useContext(UserContext)

    const dynamicRoute = useRouter().asPath

    //Next doesn't reset state when a dynamic route changes, so we need to reset the state manually
    useEffect(() => {
        setComment("")
        setComments(initialComments)
        setEnd(false)
    }, [dynamicRoute])

    const postComment = async () => {
        if (comment.length < 3 || comment.length > 100) {
            toast.error("Comment must be between 3 and 100 characters")
            return
        }
        const commentRef = collection(vidRef, "comments")
        addDoc(commentRef, {
            comment,
            createdAt: serverTimestamp(),
            username,
            photoURL: profilePicture,
        })

        setComment("")
        setComments([
            ...[
                {
                    comment,
                    createdAt: Date.now(),
                    username,
                    photoURL: profilePicture,
                },
            ],
            ...comments,
        ])
    }

    const loadMore = async () => {
        if (vidRef) {
            const last = comments[comments.length - 1]
            const cursor =
                typeof last.createdAt === "number"
                    ? Timestamp.fromMillis(last.createdAt)
                    : last.createdAt

            const commentQuery = query(
                collection(vidRef, "comments"),
                orderBy("createdAt", "desc"),
                startAfter(cursor),
                limit(1)
            )
            const newComments = (await getDocs(commentQuery)).docs.map(toJSON)
            if (newComments.length === 0) {
                setEnd(true)
            }
            setComments([...comments, ...newComments])
        }
    }

    //Detect last comment being visible
    const observer = useRef()
    const lastComment = useCallback((node) => {
        if (end) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore()
            }
        })
        if (node) observer.current.observe(node)
    })

    return (
        <div className={styles.root}>
            <div className={styles["input-container"]}>
                <Input
                    name="Write Comment"
                    value={comment}
                    func={(e) => {
                        setComment(e.target.value)
                    }}
                />
            </div>
            <Button
                name="Post Comment"
                func={postComment}
                disabled={comment.length == 0}
            />
            {comments.map((comment, index) => {
                return (
                    <div
                        ref={index === comments.length - 1 ? lastComment : null}
                        key={comment.createdAt}
                    >
                        <Comment
                            comment={comment.comment}
                            createdAt={moment(comment.createdAt).fromNow()}
                            photoURL={comment.photoURL}
                            username={comment.username}
                        />
                    </div>
                )
            })}
        </div>
    )
}
