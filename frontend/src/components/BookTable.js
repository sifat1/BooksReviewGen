import React, { useEffect, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

function BookTable({ region, seed, likes, reviews }) {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setBooks([]);
        setPage(0);
        setHasMore(true);
    }, [region, seed, likes, reviews]);

    useEffect(() => {
        if (page === 0) fetchMoreBooks();
        // eslint-disable-next-line
    }, [page]);

    const fetchMoreBooks = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/books", {
                params: { page,region, seed, likes,reviews}
            });

            const newBooks = res.data;
            setBooks(prev => [...prev, ...newBooks]);
            setPage(prev => prev + 1);

            if (newBooks.length < 10) setHasMore(false);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };

    return (
        <InfiniteScroll
            dataLength={books.length}
            next={fetchMoreBooks}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}>
            <table border="1" cellPadding={10} width="100%">
                <thead>
                <tr>
                    <th>#</th>
                    <th>ISBN</th>
                    <th>Title</th>
                    <th>Author(s)</th>
                    <th>Publisher</th>
                </tr>
                </thead>
                <tbody>
                {books.map((book, idx) => (
                    <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{book.isbn}</td>
                        <td>{book.title}</td>
                        <td>{book.authors.join(", ")}</td>
                        <td>{book.publisher}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </InfiniteScroll>
    );
}

export default BookTable;
