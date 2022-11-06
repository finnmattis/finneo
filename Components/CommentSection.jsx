import moment from "moment"
import Image from "next/image"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import Button from "../Components/Button"
import Input from "../Components/Input"
import { UserContext } from "../lib/context"
import { firestore, fromMillis, serverTimestamp, toJSON } from "../lib/firebase"
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

export default function CommentSection({ initialComments, id }) {
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
        //Post comment to firebase
        const uploadsQuerry = firestore
            .collectionGroup("uploads")
            .where("id", "==", id)

        const commentRef = (await uploadsQuerry.get()).docs[0].ref
        commentRef.collection("comments").add({
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
        const last = comments[comments.length - 1]
        const cursor =
            typeof last.createdAt === "number"
                ? fromMillis(last.createdAt)
                : last.createdAt

        const uploadsQuerry = firestore
            .collectionGroup("uploads")
            .where("id", "==", id)
        const UploadRef = (await uploadsQuerry.get()).docs[0].ref

        const commentsQuerry = UploadRef.collection("comments")
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(3)

        const newComments = (await commentsQuerry.get()).docs.map(toJSON)
        if (newComments.length === 0) {
            setEnd(true)
        }
        setComments([...comments, ...newComments])
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
            <Input
                name="Write Comment"
                value={comment}
                func={(e) => {
                    setComment(e.target.value)
                }}
            />
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
