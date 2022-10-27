import Feed from "../Components/Feed"
import { firestore, toJSON } from "../lib/firebase"
import styles from "../styles/index.module.css"

const IN_LIMIT = 8
const LOAD_LIMIT = 4

export async function getServerSideProps(context) {
    const uploadsQuery = firestore
        .collectionGroup("uploads")
        .orderBy("createdAt", "desc")
        .limit(IN_LIMIT)
    const uploads = (await uploadsQuery.get()).docs.map(toJSON)

    return {
        props: { initial_uploads: uploads },
    }
}

export default function Home({ initial_uploads }) {
    const getQuery = (cursor) => {
        return firestore
            .collectionGroup("uploads")
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(LOAD_LIMIT)
    }

    return (
        <main className={styles.root}>
            <div className={styles.filler}></div>
            <Feed
                initial_uploads={initial_uploads}
                width="95"
                query_func={getQuery}
            />
            <div className={styles.filler}></div>
        </main>
    )
}
