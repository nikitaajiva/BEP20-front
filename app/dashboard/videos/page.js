"use client";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const res = await fetch(
          "https://blogapi.bepvault.io/api/tutorials?visibility=dashboard&page=1&limit=10"
        );
        if (!res.ok) throw new Error("Failed to fetch tutorials");
        const data = await res.json();
        const tutorialsData = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setTutorials(tutorialsData);
      } catch (error) {
        console.error("Error fetching tutorials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, []);
  const handleCardClick = (tutorial) => {
    setSelectedTutorial(tutorial);
  };
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  return (
    <div
      className={`main-section ${
        selectedTutorial ? "video-open" : "video-closed"
      }`}
    >
      <div>
        <div className="BacktoVideos">
          <a
            href="/dashboard/videos"
            style={{
              display: "inline-block",
              marginTop: "20px",
              marginBottom: "20px",
              fontSize: "20px",
              textDecoration: "none",
              color: "#ffd700",
              fontWeight: "bold",
            }}
          >
            ← Back to Videos
          </a>
        </div>
        <div className="Backtowebsite">
          <a
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: "20px",
              marginBottom: "20px",
              fontSize: "20px",
              textDecoration: "none",
              color: "#ffd700",
              fontWeight: "bold",
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
      <div>
        {/* <div>
          <a
            href="/dashboard/videos"
            style={{
              display: "inline-block",
              fontSize: "20px",
              textDecoration: "none",
              color: "#ffd700",
              fontWeight: "bold",
            }}
          >
            <ArrowLeft size={18} />
            Back To Videos
          </a>
        </div> */}
        <h1 className="tutorials-heading">BEPVault Media</h1>
      </div>
      <div className="SelectedVideoPlayer">
        {/* Selected Video Player */}
        {selectedTutorial && (
          <div className="main-section-inner">
            <div className="video-wrapper">
              <iframe
                key={selectedTutorial.id}
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(
                  selectedTutorial.youtube_video
                )}?autoplay=1&rel=0&modestbranding=1&showinfo=0&fs=0&iv_load_policy=3&disablekb=1&controls=1&end=9999`}
                title={selectedTutorial.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <h2 className="video-title">{selectedTutorial.title}</h2>
          </div>
        )}
        {/* Tutorials Grid */}
        <div className="TutorialsGrid">
          {loading ? (
            <p>Loading ...</p>
          ) : tutorials.length === 0 ? (
            <p>No Videos found</p>
          ) : (
            tutorials.map((tut) => {
              const videoId = getYouTubeId(tut.youtube_video);
              return (
                <div
                  className="TutorialsGrid-card"
                  key={tut.id}
                  onClick={() => handleCardClick(tut)}
                >
                  <div className="TutorialsGrid-card-inner-section">
                    <div className="TutorialsGrid-card-video-section">
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={tut.title}
                        />
                      ) : (
                        <div className="no-video">No Video</div>
                      )}
                      <span className="video-duration">25:11</span>
                    </div>
                    <div className="TutorialsGrid-card-text">
                      <h3>{tut.title}</h3>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
