import axios from "axios";
import { use } from "react";

function ReviewList({ isbn, regions, seed , reviews})
{

    const [reviewsList, setReviewsList] = useState([]);
    useEffect(() => {
        var reviewsList = axios.get(`http://localhost:8080/api/Books/${isbn}/reviews`, {
    params: { region, reviews: reviewsCount },
  }) || [regions, seed , reviews];

    var reviewsList = reviewsList.map((review) => ({
        reviewer: review.user,
        comment: review.text
    }));

    setReviewsList(reviewsList);

    }, []); 

    return (
        <div className="review-list">
            <h3>Reviews</h3>
            {reviewsList.length > 0 ? (
                <ul className="list-group">
                    {reviewsList.map((review, index) => (
                        <li key={index} className="list-group-item">
                            <strong>{review.reviewer}:</strong> {review.comment}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reviews available.</p>
            )}
        </div>
    );

    
}