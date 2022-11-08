import {
    collectionGroup,
    getDocs,
    limit,
    orderBy,
    query,
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
    return (
        <main className={styles.root}>
            <Search />
            <div className={styles.filler}></div>
            <Feed
                initialUploads={initialUploads}
                widthNum="95"
                IN_LIMIT={IN_LIMIT}
                LOAD_LIMIT={4}
            />
            <div className={styles.filler}></div>
        </main>
    )
}
