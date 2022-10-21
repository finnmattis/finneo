import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Button from "../Components/Button"
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

export default function Feed({ uploads, load_func, end, width }) {
    if (uploads.length == 0) {
        return <p>:(</p>
    }

    let sections = []
    let section_ammount = Math.floor(width / 25)
    let i = 0
    while (uploads.length > i) {
        sections.push(uploads.slice(i, i + section_ammount))
        i += section_ammount
    }

    return (
        <div
            className={styles.root}
            style={{ minHeight: "90vh", width: `${width}%` }}
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
                    <Button name="Load More" func={load_func} />
                )}
            </div>
        </div>
    )
}
