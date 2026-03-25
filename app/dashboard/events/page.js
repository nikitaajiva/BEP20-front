"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
export default function Eventsa() {
  const router = useRouter();
  const [event, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          "https://blogapi.BEPVault.io/api/events/public?page=1&limit=12"
        );
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data?.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCardClick = (slug) => {
    router.push(`/dashboard/events/${slug}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        // backgroundColor: "#0f172a",
        color: "white",
        padding: "24px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <div>
        <div>
          <a
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: "20px",
              marginBottom: "20px",
              fontSize: "20px",
              textDecoration: "none",
              color: "rgb(124, 77, 255)",
              fontWeight: "bold",
            }}
          >
            <ArrowLeft size={18} />
            Back To Dashboard
          </a>
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          XRP Ocean Events
        </h1>
      </div>

      {/* Events Grid */}
      <div className="EventsGrid-card">
        {loading ? (
          <p>Loading events...</p>
        ) : event.length === 0 ? (
          <p>No events found</p>
        ) : (
          event.map((ev, index) => (
            <div
              className="EventsGrid-card-inner"
              key={index}
              onClick={() => handleCardClick(ev.slug)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div>
                <div
                  style={{
                    width: "100%",
                    height: "240px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                  }}
                >
                  <img
                    src={ev.featured_image}
                    alt={ev.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "6px",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    // color: "#c084fc",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {new Date(ev.event_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {/* <span
                    style={{
                      backgroundColor: "#7e22ce",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      marginLeft: "8px",
                    }}
                  >
                    {ev.event_type || "Conference"}
                  </span> */}
                </div>

                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {ev.title}
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    marginTop: "8px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: ev.description }} />
                </p>
              </div>
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                <span>
                  <svg
                    fill="red"
                    width={20}
                    height={20}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                  >
                    <path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z" />
                  </svg>
                </span>{" "}
                {ev.location || "Unknown Location"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
