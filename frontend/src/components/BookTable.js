import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { Table, Card, Button, Spinner, Alert } from "react-bootstrap";
import BookRow from "./BookRow";


const fetchBooks = async (page, region, seed, likes, reviewsCount) => {
  const res = await axios.get("https://book-backend-1-dwnw.onrender.com/api/Books", {
    params: { page, region, seed, likes, reviews: reviewsCount },
  });
  return res.data;
};

function BookTable({ region = "en", seed = 0, likes = 0, reviewsCount = 3 }) {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedBook, setExpandedBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBooks([]);
    setPage(0);
    setHasMore(true);
    setExpandedBook(null);
    setError(null);
  }, [region, seed, likes, reviewsCount]);

  useEffect(() => {
    if (page === 0) fetchMoreBooks();
  }, [page]);

  const fetchMoreBooks = useCallback(async () => {
    try {
      const newBooks = await fetchBooks(page, region, seed, likes, reviewsCount);
      setBooks((prev) => [...prev, ...newBooks]);
      setPage((prev) => prev + 1);
      setHasMore(newBooks.length >= 10);
      setError(null);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
    }
  }, [page, region, seed, likes, reviewsCount]);

  const toggleBook = (isbn) => {
    setExpandedBook((prev) => (prev === isbn ? null : isbn));
  };

  const renderLoader = () => (
    <div className="text-center my-3">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p>Loading more books...</p>
    </div>
  );

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
        <Button variant="outline-danger" onClick={fetchMoreBooks} className="ms-3">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container mt-4">
      <InfiniteScroll dataLength={books.length} next={fetchMoreBooks} hasMore={hasMore} loader={renderLoader()} >
        <Card className="shadow-sm mb-3">
          <Card.Header as="h4" className="bg-dark text-white">Book List</Card.Header>
          <Table striped bordered hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Author(s)</th>
                <th>Publisher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, idx) => (
                <BookRow
                  key={`${book.isbn}-${idx}`}
                  book={book}
                  idx={idx}
                  expandedBook={expandedBook}
                  toggleBook={toggleBook}
                  region={region}
                  seed={seed}
                  reviewsCount={reviewsCount}
                />
              ))}
            </tbody>
          </Table>
        </Card>

        {books.length === 0 && !error && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading initial books...</p>
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
}

export default BookTable;
