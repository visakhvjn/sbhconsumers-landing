import SkinGuideChat from "./SkinGuideChat";

const COVERS = [
  "Routines",
  "Ingredients",
  "Product picks",
  "Acne",
  "Oil control",
  "Dark spots",
  "Sunscreen",
  "Shaving irritation",
];

export default function GuideSection() {
  return (
    <section className="guide" id="guide" aria-labelledby="guide-title">
      <div className="wrap guide-grid">
        <div className="guide-copy">
          <span className="kicker">Skin guide</span>
          <h2 id="guide-title">
            Unsure <mark>what your skin needs?</mark>
          </h2>
          <p>
            Not sure what your skin type is, what to put on it, or which products to buy? This simple
            chatbot gives you straight answers. Ask it anything and find out what your skin needs.
          </p>
          <ul className="covers" aria-label="What the guide covers">
            {COVERS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <SkinGuideChat />
      </div>
    </section>
  );
}
