import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import Button from "../Components/Button"
import { fromMillis } from "../lib/firebase"
import styles from "../styles/Feed.module.css"

function Video({ id, title, thumbnailURL, description }) {
    const [hover, setHover] = useState(false)

    return (
        <Link href={`/watch/${id}`}>
            <div
                className={styles.container}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div className={`${styles.video} ${hover ? styles.hover : ""}`}>
                    <Image src={thumbnailURL} layout="fill" />
                </div>
                <h3 className={`${styles.title} ${hover ? styles.appear : ""}`}>
                    {title}
                </h3>
                <h1
                    className={`${styles.description} ${
                        hover ? styles.appear : ""
                    }`}
                >
                    {description}
                </h1>
            </div>
        </Link>
    )
}

export default function Feed({ initial_uploads, width, querry_func }) {
    const [uploads, setUploads] = useState(initial_uploads)
    const [end, setEnd] = useState(false)

    const LIMIT = Math.floor(width / 25)
    const LOAD_LIMIT = Math.floor(LIMIT / 2)

    useEffect(() => {
        if (initial_uploads.length === 0) {
            setEnd(true)
        }
    })

    const loadMore = async () => {
        const last = uploads[uploads.length - 1]
        const cursor =
            typeof last.createdAt === "number"
                ? fromMillis(last.createdAt)
                : last.createdAt

        const uploadsQuerry = querry_func(cursor)
        const new_uploads = (await uploadsQuerry.get()).docs.map((doc) =>
            doc.data()
        )

        setUploads(uploads.concat(new_uploads))
        if (new_uploads.length < LOAD_LIMIT) {
            setEnd(true)
        }
    }

    let sections = []
    let i = 0
    while (uploads.length > i) {
        sections.push(uploads.slice(i, i + LIMIT))
        i += LIMIT
    }

    return (
        <div
            className={styles.root}
            style={{ minHeight: "90vh", width: `${width}vw` }}
        >
            {sections.map((section, index) => {
                return (
                    <div
                        style={{
                            justifyContent:
                                width < 50 ? "center" : "space-between",
                        }}
                        className={styles.section}
                        key={index}
                    >
                        {section.map((upload) => {
                            return (
                                <Video
                                    key={upload.id}
                                    id={upload.id}
                                    title={upload.title}
                                    thumbnailURL={upload.thumbnailURL}
                                    description={upload.description}
                                />
                            )
                        })}
                    </div>
                )
            })}
            <div className={styles.center}>
                {end ? (
                    <p className={styles["end-text"]}>
                        You have reached the end!
                    </p>
                ) : (
                    <Button name="Load More" func={loadMore} />
                )}
            </div>
        </div>
    )
}
