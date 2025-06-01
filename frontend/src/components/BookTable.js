import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { Table, Card, Button, Spinner, ListGroup, Badge, Alert } from 'react-bootstrap';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';

// API Service functions
const fetchBooks = async (page, region, seed, likes, reviewsCount) => {
  const res = await axios.get("http://localhost:8080/api/Books", {
    params: { page, region, seed, likes, reviews: reviewsCount },
  });
  return res.data;
};

const fetchReviews = async (isbn, region, reviewsCount) => {
  const res = await axios.get(`http://localhost:8080/api/Books/${isbn}/reviews`, {
    params: { region, reviews: reviewsCount },
  });
  return res.data;
};

function BookTable({ region = "en", seed = 0, likes = 0, reviewsCount = 3 }) {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedBook, setExpandedBook] = useState(null);
  const [bookReviews, setBookReviews] = useState({});
  const [error, setError] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState({});

  // Reset state when dependencies change
  useEffect(() => {
    setBooks([]);
    setPage(0);
    setHasMore(true);
    setExpandedBook(null);
    setBookReviews({});
    setError(null);
    setLoadingReviews({});
  }, [region, seed, likes, reviewsCount]);

  useEffect(() => {
    if (page === 0) fetchMoreBooks();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const toggleBook = async (isbn) => {
    if (expandedBook === isbn) {
      setExpandedBook(null);
      return;
    }

    setExpandedBook(isbn);

    if (!bookReviews[isbn]) {
      try {
        setLoadingReviews(prev => ({ ...prev, [isbn]: true }));
        const reviewsData = await fetchReviews(isbn, region, reviewsCount);
        setBookReviews(prev => ({ ...prev, [isbn]: reviewsData }));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setBookReviews(prev => ({
          ...prev,
          [isbn]: [{ user: "Error", text: err.message || "Failed to load reviews" }],
        }));
      } finally {
        setLoadingReviews(prev => ({ ...prev, [isbn]: false }));
      }
    }
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

  // In your return JSX:
  return (
    <div className="container mt-4">
      <InfiniteScroll
        dataLength={books.length}
        next={fetchMoreBooks}
        hasMore={hasMore}
        loader={renderLoader()}
      >
        <Card className="shadow-sm mb-3"> {/* 🔥 Wrap the table in a card for visual balance */}
          <Card.Header as="h4" className="bg-dark text-white">
            Book List
          </Card.Header>
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
                <React.Fragment key={`${book.isbn}-${idx}`}>
                  <tr>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{book.title}</strong>
                      <div className="text-muted small">ISBN: {book.isbn}</div>
                    </td>
                    <td>{Array.isArray(book.authors) && book.authors.length > 0 ? book.authors.join(", ") : "Unknown author"}</td>
                    <td>{book.publisher}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => toggleBook(book.isbn)}
                        aria-expanded={expandedBook === book.isbn}
                      >
                        {expandedBook === book.isbn ? (
                          <>
                            <ChevronUp /> Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown /> Details
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                  {expandedBook === book.isbn && (
                    <tr>
                      <td colSpan={5} className="bg-light">
                        <Card className="border-0">
                          <Card.Body>
                            <h5 className="mb-3 text-primary">Book Details</h5>
                            <div className="row">
                              <div className="col-md-6">
                                <p><strong>Title:</strong> {book.title}</p>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                                <p><strong>Publisher:</strong> {book.publisher}</p>
                              </div>
                              <div className="col-md-6">
                                <h6 className="text-secondary">
                                  Reviews{" "}
                                  <Badge bg="secondary" pill>
                                    {bookReviews[book.isbn]?.length || 0}
                                  </Badge>
                                </h6>
                                {loadingReviews[book.isbn] ? (
                                  <div className="text-center my-2">
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2">Loading reviews...</span>
                                  </div>
                                ) : (
                                  <ReviewList reviews={bookReviews[book.isbn]} />
                                )}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

const ReviewList = ({ reviews }) => {
  if (!reviews) return null;
  if (reviews.length === 0) return <Alert variant="info">No reviews available</Alert>;

  return (
    <ListGroup variant="flush">
      {reviews.map((review, i) => (
        <ListGroup.Item key={i}>
          <div className="d-flex justify-content-between">
            <strong>{review.user || "Anonymous"}</strong>
            {review.rating && (
              <Badge bg="warning" text="dark">
                {review.rating}/5
              </Badge>
            )}
          </div>
          <p className="mb-0 mt-1">{review.text}</p>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default BookTable;