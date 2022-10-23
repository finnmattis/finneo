import Image from "next/image"
import { useEffect, useState } from "react"
import Feed from "../../Components/Feed"
import { firestore, fromMillis, toJSON } from "../../lib/firebase"
import styles from "../../styles/UsernamePage.module.css"

const IN_LIMIT = 6
const LOAD_LIMIT = 3

export async function getServerSideProps(context) {
    const { username } = context.params

    const idQuerry = firestore.collection("usernames").doc(username)
    let id = await idQuerry.get()
    if (id.exists) {
        id = id.data().uid
    } else {
        return {
            props: {
                exists: false,
            },
        }
    }

    const ProfileQuerry = firestore.collection("users").doc(id)
    const photoURL = (await ProfileQuerry.get()).data().photoURL

    const uploadsQuerry = firestore
        .collection("users")
        .doc(id)
        .collection("uploads")
        .orderBy("createdAt", "desc")
        .limit(IN_LIMIT)

    const uploads = (await uploadsQuerry.get()).docs.map(toJSON)
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
    const getQuerry = (cursor) => {
        return firestore
            .collection("users")
            .doc(id)
            .collection("uploads")
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(LOAD_LIMIT)
    }

    return (
        <main className={styles.root}>
            {exists ? (
                <>
                    <p className={styles.username}>{username}</p>
                    <div className={styles.profile}>
                        <Image src={photoURL} layout="fill" />
                    </div>
                    <Feed
                        initial_uploads={initial_uploads}
                        width="95"
                        querry_func={getQuerry}
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
