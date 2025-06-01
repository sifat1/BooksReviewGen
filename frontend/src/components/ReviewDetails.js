import axios from "axios";
import React, { useState, useEffect } from "react";

function ReviewList({ isbn, regions, seed, reviews }) {
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/Books/${isbn}/reviews`, {
          params: { regions, seed, reviewsCount : reviews },
        });

        const formatted = res.data.map((review) => ({
          reviewer: review.user,
          comment: review.text,
        }));

        setReviewsList(formatted);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviewsList([{ reviewer: "Error", comment: "Could not fetch reviews." }]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isbn, regions, seed, reviews]);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="review-list">
      {reviewsList.length > 0 ? (
        <ul className="list-group list-group-flush">
          {reviewsList.map((review, index) => (
            <li key={index} className="list-group-item">
              <strong>{review.reviewer}:</strong>
              <p className="mb-0">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews available.</p>
      )}
    </div>
  );
}

export default ReviewList;
