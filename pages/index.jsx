import Feed from "../Components/Feed"
import { firestore, fromMillis, toJSON } from "../lib/firebase"
import styles from "../styles/index.module.css"

const IN_LIMIT = 6
const LOAD_LIMIT = 3

export async function getServerSideProps(context) {
    const uploadsQuerry = firestore
        .collectionGroup("uploads")
        .orderBy("createdAt", "desc")
        .limit(IN_LIMIT)
    const uploads = (await uploadsQuerry.get()).docs.map(toJSON)

    return {
        props: { initial_uploads: uploads },
    }
}

export default function Home({ initial_uploads }) {
    const getQuerry = (cursor) => {
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
                querry_func={getQuerry}
            />
            <div className={styles.filler}></div>
        </main>
    )
}
