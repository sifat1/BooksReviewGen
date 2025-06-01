import React, { useState } from "react";
import BookTable from "./components/BookTable";

function App() {
  const [region, setRegion] = useState("en");
  const [seed, setSeed] = useState("1234");
  const [likes, setLikes] = useState(3.5);
  const [reviews, setReviews] = useState(4.0);

  const regions = [
    { code: "en", label: "English (USA)" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" }
  ];

  const randomizeSeed = () => setSeed(Math.floor(Math.random() * 100000).toString());

  return (
      <div style={{ padding: 20 }}>
        <h1>Book Generator</h1>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <select value={region} onChange={e => setRegion(e.target.value)}>
            {regions.map(r => (
                <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>

          <input value={seed} onChange={e => setSeed(e.target.value)} placeholder="Seed" />
          <button onClick={randomizeSeed}>Random Seed</button>

          <label>
            Likes:
            <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={likes}
                onChange={e => setLikes(parseFloat(e.target.value))}
            />
            {likes}
          </label>

          <label>
            Reviews:
            <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={reviews}
                onChange={e => setReviews(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <BookTable region={region} seed={seed} likes={likes} reviews={reviews} />
      </div>
  );
}

export default App;
