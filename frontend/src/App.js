import React, { useState } from "react";
import BookTable from "./components/BookTable";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [region, setRegion] = useState("en");
  const [seed, setSeed] = useState("1234");
  const [likes, setLikes] = useState(3.5);
  const [reviews, setReviews] = useState(4.0);

  const regions = [
    { code: "en", label: "English (USA)" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
  ];

  const randomizeSeed = () =>
    setSeed(Math.floor(Math.random() * 100000).toString());

  const getIntReviews = (value) => {
    const intVal = Math.floor(value);
    return value - intVal === 0.5 ? intVal + 1 : intVal;
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary text-center"> Book Generator</h1>

      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Language Region</label>
          <select
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Seed</label>
          <div className="input-group">
            <input
              className="form-control"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Seed"
            />
            <button className="btn btn-outline-secondary" onClick={randomizeSeed}>
              Seed
            </button>
          </div>
        </div>

        <div className="col-md-3">
          <label className="form-label">Likes: {likes}</label>
          <input
            type="range"
            className="form-range"
            min={0}
            max={10}
            step={0.1}
            value={likes}
            onChange={(e) => setLikes(parseFloat(e.target.value))}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Reviews</label>
          <input
            type="number"
            className="form-control"
            min={0}
            max={10}
            step={0.1}
            value={reviews}
            onChange={(e) => setReviews(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <hr className="my-4" />

      <BookTable
        region={region}
        seed={seed}
        likes={likes}
        reviewsCount={getIntReviews(reviews)}
      />
    </div>
  );
}

export default App;
