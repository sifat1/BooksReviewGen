function BookDetails({ book }) {
  return (
    <div className="book-details">
      <h2>{book.title}</h2>
      <image src={book.coverImage} alt={`${book.title} cover`} className="img-fluid mb-3" />
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Author:</strong> {Array.isArray(book.authors) && book.authors.length > 0 ? book.authors.join(", ") : "Unknown author"}</p>
      <p><strong>Likes:</strong> {book.likes}</p>
    </div>
  );
}

export default BookDetails;