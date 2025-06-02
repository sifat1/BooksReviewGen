import React from "react";
import { Button, Card, Badge } from "react-bootstrap";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import BookDetails from "./BookDetails";
import ReviewList from "./ReviewDetails";

const BookRow = ({ book, idx, expandedBook, toggleBook, region, seed, reviewsCount }) => (
  <>
    <tr>
      <td>{idx + 1}</td>
      <td>
        <strong>{book.title}</strong>
        <div className="text-muted small">ISBN: {book.isbn}</div>
      </td>
      <td>{book.authors?.join(", ") || "Unknown author"}</td>
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
                  <BookDetails book={book} />
                </div>
                <div className="col-md-6">
                  <h6 className="text-secondary">
                    Reviews <Badge bg="secondary">{reviewsCount}</Badge>
                  </h6>
                  <ReviewList isbn={book.isbn} regions={region} seed={seed} reviews={reviewsCount} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </td>
      </tr>
    )}
  </>
);

export default BookRow;
