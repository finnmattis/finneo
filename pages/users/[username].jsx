import Image from "next/image"
import Feed from "../../Components/Feed"
import { firestore, toJSON } from "../../lib/firebase"
import styles from "../../styles/UsernamePage.module.css"

const IN_LIMIT = 8
const LOAD_LIMIT = 4

export async function getServerSideProps(context) {
    const { username } = context.params

    const idQuery = firestore.collection("usernames").doc(username)
    let id = await idQuery.get()
    if (id.exists) {
        id = id.data().uid
    } else {
        return {
            props: {
                exists: false,
            },
        }
    }

    const ProfileQuery = firestore.collection("users").doc(id)
    const photoURL = (await ProfileQuery.get()).data().photoURL

    const uploadsQuery = firestore
        .collection("users")
        .doc(id)
        .collection("uploads")
        .orderBy("createdAt", "desc")
        .limit(IN_LIMIT)

    const uploads = (await uploadsQuery.get()).docs.map(toJSON)
    return {
        props: {
            exists: true,
            username,
            photoURL,
            id,
            initial_uploads: uploads,
        },
    }
}

export default function UsernamePage({
    exists,
    username,
    photoURL,
    id,
    initial_uploads,
}) {
    return (
        <main className={styles.root}>
            {exists ? (
                <>
                    <p className={styles.username}>{username}</p>
                    <div className={styles.profile}>
                        <Image src={photoURL} alt="profile" layout="fill" />
                    </div>
                    <Feed
                        initial_uploads={initial_uploads}
                        width="95"
                        LOAD_LIMIT={LOAD_LIMIT}
                        IN_LIMIT={IN_LIMIT}
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
