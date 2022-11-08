import {
    collectionGroup,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
} from "firebase/firestore"
import Feed from "../Components/Feed"
import Search from "../Components/Search"
import { firestore, toJSON } from "../lib/firebase"
import styles from "../styles/index.module.css"

const IN_LIMIT = 8

export async function getServerSideProps(context) {
    const uploadsQuery = query(
        collectionGroup(firestore, "uploads"),
        orderBy("createdAt", "desc"),
        limit(IN_LIMIT)
    )

    const uploads = (await getDocs(uploadsQuery)).docs.map(toJSON)

    return {
        props: { initialUploads: uploads },
    }
}

export default function Home({ initialUploads }) {
    const getFeedQuery = (cursor, asc) => {
        return query(
            collectionGroup(firestore, "uploads"),
            orderBy("createdAt", asc ? "asc" : "desc"),
            startAfter(cursor),
            limit(IN_LIMIT)
        )
    }

    const getInFeedQuery = () => {
        return query(
            collectionGroup(firestore, "uploads"),
            orderBy("createdAt"),
            limit(IN_LIMIT)
        )
    }

    return (
        <main className={styles.root}>
            <Search />
            <div className={styles.filler}></div>
            <Feed
                initialUploads={initialUploads}
                widthNum="95"
                queryFunc={getFeedQuery}
                inQueryFunc={getInFeedQuery}
            />
            <div className={styles.filler}></div>
        </main>
    )
}
