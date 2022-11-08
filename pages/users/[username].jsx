import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
} from "firebase/firestore"
import Image from "next/image"
import Feed from "../../Components/Feed"
import { firestore, toJSON } from "../../lib/firebase"
import styles from "../../styles/UsernamePage.module.css"

const IN_LIMIT = 8
const LOAD_LIMIT = 4

export async function getServerSideProps(context) {
    const { username } = context.params

    const idQuery = doc(firestore, "usernames", username)
    let id = await getDoc(idQuery)
    if (id.exists()) {
        id = id.data().uid
    } else {
        return {
            props: {
                exists: false,
            },
        }
    }

    const profileQuery = doc(firestore, "users", id)
    const photoURL = (await getDoc(profileQuery)).data().photoURL

    const uploadsQuery = query(
        collection(firestore, "users", id, "uploads"),
        orderBy("createdAt", "desc"),
        limit(IN_LIMIT)
    )

    const uploads = (await getDocs(uploadsQuery)).docs.map(toJSON)

    return {
        props: {
            exists: true,
            username,
            id,
            photoURL,
            initialUploads: uploads,
        },
    }
}

export default function UsernamePage({
    exists,
    username,
    id,
    photoURL,
    initialUploads,
}) {
    const getFeedQuery = (cursor, asc) => {
        return query(
            collection(firestore, "users", id, "uploads"),
            orderBy("createdAt", asc ? "asc" : "desc"),
            startAfter(cursor),
            limit(IN_LIMIT)
        )
    }

    const getInFeedQuerry = () => {
        return query(
            collection(firestore, "users", id, "uploads"),
            orderBy("createdAt", "desc"),
            limit(IN_LIMIT)
        )
    }

    return (
        <main className={styles.root}>
            {exists ? (
                <>
                    <p className={styles.username}>{username}</p>
                    <div className={styles.profile}>
                        <Image src={photoURL} alt="profile" layout="fill" />
                    </div>
                    <Feed
                        initialUploads={initialUploads}
                        widthNum="95"
                        queryFunc={getFeedQuery}
                        inQueryFunc={getInFeedQuerry}
                    />
                    <div className={styles.filler}></div>
                </>
            ) : (
                <div className={styles["nothing-container"]}>
                    <p className={styles["nothing-text"]}>Nothing Here!</p>
                </div>
            )}
        </main>
    )
}
