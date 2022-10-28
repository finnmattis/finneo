import moment from "moment"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useRef, useState } from "react"
import { fromMillis } from "../lib/firebase"
import styles from "../styles/Feed.module.css"

const LOAD_LIMIT = 4

function Video({
    width,
    id,
    profile,
    author,
    title,
    thumbnailURL,
    views,
    createdAt,
}) {
    const vert = width <= 25
    return (
        <Link href={`/watch/${id}`}>
            <div
                className={
                    vert
                        ? styles["vid-container-vert"]
                        : styles["vid-container"]
                }
            >
                <div className={styles.video}>
                    <Image src={thumbnailURL} alt="thumbnail" layout="fill" />
                </div>
                <div className={styles["info-container"]}>
                    <div
                        className={styles.profile}
                        style={{ display: vert ? "none" : "" }}
                    >
                        <Image
                            src={profile || "/user.png"}
                            alt="profile"
                            layout="fill"
                        ></Image>
                    </div>
                    <div className={styles["text-container"]}>
                        <h3
                            className={`${styles.title} ${
                                vert ? styles["title-vert"] : ""
                            }`}
                        >
                            {title}
                        </h3>
                        <h3
                            className={`${styles["misc-text"]} ${
                                vert ? styles["misc-text-vert"] : ""
                            }`}
                        >
                            Finn
                        </h3>
                        <h1
                            className={`${styles["misc-text"]} ${
                                vert ? styles["misc-text-vert"] : ""
                            }`}
                        >
                            {views} views • {createdAt}
                        </h1>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function Feed({ initial_uploads, width, query_func }) {
    const [uploads, setUploads] = useState(initial_uploads)
    const [end, setEnd] = useState(false)
    const [loading, setLoading] = useState(false)

    if (initial_uploads.length === 0) {
        setEnd(true)
    }

    const loadMore = async () => {
        setLoading(true)
        const last = uploads[uploads.length - 1]
        const cursor =
            typeof last.createdAt === "number"
                ? fromMillis(last.createdAt)
                : last.createdAt

        const uploadsQuery = query_func(cursor)
        const new_uploads = (await uploadsQuery.get()).docs.map((doc) =>
            doc.data()
        )

        setUploads(uploads.concat(new_uploads))
        if (new_uploads.length < LOAD_LIMIT) {
            setEnd(true)
        }
        setLoading(false)
    }

    const observer = useRef()
    const lastVid = useCallback((node) => {
        if (loading || end) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore()
            }
        })
        if (node) observer.current.observe(node)
    })

    return (
        <div className={styles.root} style={{ width: `${width}vw` }}>
            <div className={styles.feed}>
                {uploads.map((upload, index) => {
                    return (
                        <div
                            ref={index + 1 === uploads.length ? lastVid : null}
                            key={upload.id}
                        >
                            <Video
                                width={width}
                                id={upload.id}
                                photoURL={upload.photoURL}
                                author={upload.author}
                                title={upload.title}
                                thumbnailURL={upload.thumbnailURL}
                                views={upload.views}
                                createdAt={moment(upload.createdAt).fromNow()}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
