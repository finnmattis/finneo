import Feed from "../Components/Feed"
import { firestore, toJSON } from "../lib/firebase"
import styles from "../styles/index.module.css"

const LIMIT = 6

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

export default function Home({ uploads }) {
    return (
        <main className={styles.root}>
            <div className={styles.filler}></div>
            <Feed initial_uploads={uploads} width="95" />
            <div className={styles.filler}></div>
        </main>
    )
}
