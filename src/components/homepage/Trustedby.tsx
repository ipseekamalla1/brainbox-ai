import "@/css/home.css";

const trustedBy = [
  "MIT OpenCourseWare",
  "Stanford Online",
  "Harvard Extension",
  "Coursera EDU",
  "EdX University",
];

export default function TrustedBy() {
  return (
    <div className="trusted-wrapper">
      <div className="trusted-inner">
        <span className="trusted-label">Trusted by</span>

        <div className="trusted-mask">
          <div className="marquee-track">
            {[...trustedBy, ...trustedBy].map((name, i) => (
              <span key={i} className="trusted-item">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}