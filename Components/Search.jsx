import algoliasearch from "algoliasearch/lite"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch-hooks"
import styles from "../styles/Search.module.css"

export function Hits(props) {
    const { hits } = useHits(props)
    const num_hits = 5
    return (
        <div>
            <div className={styles["hits-list"]}>
                {hits.length > 0 ? (
                    hits.slice(0, num_hits).map((hit) => (
                        <Link key={hit.objectID} href={`/watch/${hit.id}`}>
                            <div className={styles.hit}>
                                <p>{hit.title}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No Results!</p>
                )}
            </div>
        </div>
    )
}

function SearchBox({ func }) {
    const { query, refine } = useSearchBox()
    const [value, setValue] = useState(query)
    const inputRef = useRef()

    const handleEscape = (e) => {
        if (e.key === "Escape") {
            inputRef.current.blur()
            func(false)
        }
        if (e.key === "/") {
            // Stop '/' from going to search bar
            e.preventDefault()
            inputRef.current.focus()
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleEscape, false)
        return () => {
            document.removeEventListener("keydown", handleEscape, false)
        }
    }, [])

    function onChange(event) {
        setValue(event.currentTarget.value)
    }

    useEffect(() => {
        if (query !== value) {
            refine(value)
        }
        // We want to track when the value coming from the React state changes
        // to update the InstantSearch.js query, so we don't need to track the
        // InstantSearch.js query.
    }, [value, refine])

    useEffect(() => {
        if (query !== value) {
            setValue(query)
        }
        // We want to track when the query coming from InstantSearch.js changes
        // to update the React state, so we don't need to track the state value.
    }, [query])

    return (
        <input
            className={styles.input}
            ref={inputRef}
            type="text"
            value={value}
            onChange={onChange}
            onFocus={(e) => {
                func(true)
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            maxLength={20}
        />
    )
}

export default function Search() {
    const [searchShown, setSearchShown] = useState(false)
    const searchRef = useRef()
    const hitsRef = useRef()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                hitsRef.current &&
                !hitsRef.current.contains(event.target) &&
                !searchRef.current.contains(event.target)
            ) {
                setSearchShown(false)
            }
        }
        document.addEventListener("click", handleClickOutside, true)
        return () => {
            document.removeEventListener("click", handleClickOutside, true)
        }
    }, [])

    const searchClient = algoliasearch(
        "UWZVYKMWW2",
        "de6aa0e0d181c3ed4a8406c3b7f0056a"
    )

    return (
        <InstantSearch searchClient={searchClient} indexName="finneo">
            <div ref={searchRef}>
                <SearchBox func={setSearchShown} />
            </div>
            <div
                className={`${styles["hits-container"]} ${
                    searchShown ? styles.shown : ""
                }`}
                ref={hitsRef}
            >
                <Hits />
            </div>
        </InstantSearch>
    )
}
