import Feed from "../Components/Feed"
import Search from "../Components/Search"
import { firestore, toJSON } from "../lib/firebase"
import styles from "../styles/index.module.css"

const IN_LIMIT = 8

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
    return (
        <main className={styles.root}>
            <Search />
            <div className={styles.filler}></div>
            <Feed
                initial_uploads={initial_uploads}
                width="95"
                IN_LIMIT={8}
                LOAD_LIMIT={4}
            />
            <div className={styles.filler}></div>
        </main>
    )
}
