import { useEffect, useState } from "react"
import Feed from "../Components/Feed"
import { firestore, fromMillis, toJSON } from "../lib/firebase"
import styles from "../styles/index.module.css"

const LIMIT = 3

export async function getServerSideProps(context) {
    const uploadsQuerry = firestore
        .collectionGroup("uploads")
        .orderBy("createdAt", "desc")
        .limit(LIMIT)
    const uploads = (await uploadsQuerry.get()).docs.map(toJSON)

    return {
        props: { uploads },
    }
}

export default function Home(props) {
    const [uploads, SetUploads] = useState(props.uploads)
    const [end, setEnd] = useState(false)

    useEffect(() => {
        if (uploads.length === 0) {
            setEnd(true)
        }
    })

    const loadMore = async () => {
        const last = uploads[uploads.length - 1]

        const cursor =
            typeof last.createdAt === "number"
                ? fromMillis(last.createdAt)
                : last.createdAt
        const uploadsQuerry = firestore
            .collectionGroup("uploads")
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(LIMIT)
        const new_uploads = (await uploadsQuerry.get()).docs.map((doc) =>
            doc.data()
        )

        SetUploads(uploads.concat(new_uploads))

        if (new_uploads.length < LIMIT) {
            setEnd(true)
        }
    }

    return (
        <main className={styles.root}>
            <div className={styles.filler}></div>
            <Feed uploads={uploads} load_func={loadMore} end={end} width="95" />
            <div className={styles.filler}></div>
        </main>
    )
}
