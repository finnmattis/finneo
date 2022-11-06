import Head from "next/head"
import { Toaster } from "react-hot-toast"
import Header from "../Components/Header"
import { UserContext } from "../lib/context"
import { useUserData } from "../lib/hooks"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
    const userData = useUserData()
    return (
        <UserContext.Provider value={userData}>
            <Head>
                <title>Finneo</title>
                <meta
                    name="description"
                    content="The Best Video Sharing Platform."
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <Component {...pageProps} />
            <Toaster
                toastOptions={{
                    style: {
                        backgroundColor: "rgb(30, 30, 40)",
                        color: "rgb(140, 140, 160)",
                    },
                }}
            />
        </UserContext.Provider>
    )
}

export default MyApp
