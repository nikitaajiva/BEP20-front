"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
export default function SingleEventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null); // track current image in lightbox
  console.log(event, "event");
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://blogapi.BEPVault.io/api/events/public/${slug}`
        );
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEvent(data?.data || null);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Unable to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading)
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        🔄 Loading event...
      </div>
    );

  if (error || !event)
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        ❌ {error || "Event not found"}
      </div>
    );

  const {
    title,
    description,
    event_date,
    end_date,
    featured_image,
    gallery_images,
    event_type,
    location,
    organizer,
    is_virtual,
    category,
    tags,
    status,
    views,
    short_description,
    likes,
    createdAt,
    updatedAt,
  } = event;

  const gallery = Array.isArray(gallery_images) ? gallery_images : [];

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) => (i > 0 ? i - 1 : gallery.length - 1));
  const nextImage = () =>
    setLightboxIndex((i) => (i < gallery.length - 1 ? i + 1 : 0));

  return (
    <div
      style={{
        minHeight: "100vh",
        // backgroundColor: "#0f172a",
        color: "#f3f4f6",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          // backgroundColor: "#1e293b",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <a
            href="/dashboard/events"
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
            Back To Events
          </a>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "36px", fontWeight: "700" }}>
          {title || "Untitled Event"}
        </h1>
        {/* Date & Type */}
        <p style={{ fontSize: "14px", color: "#c084fc" }}>
          {event_date
            ? new Date(event_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "N/A"}{" "}
          {end_date
            ? new Date(end_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""}
          {/* <span
            style={{
              backgroundColor: "#7e22ce",
              color: "white",
              padding: "4px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              marginLeft: "10px",
              fontWeight: "500",
            }}
          >
            {event_type || "Conference"}
          </span> */}
        </p>
        {/* Featured Image */}
        {featured_image ? (
          <div style={{}}>
            <img
              src={featured_image}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "220px",
              backgroundColor: "#334155",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
            }}
          >
            No Image Available
          </div>
        )}

        {/* Description */}
        <div>
          <p style={{ fontSize: "16px", color: "#d1d5db", lineHeight: "1.7" }}>
            <div dangerouslySetInnerHTML={{ __html: description }} />
            {/* {description || "No description available."} */}
          </p>
          <p style={{ fontSize: "16px", color: "#d1d5db", lineHeight: "1.7" }}>
            {short_description || ""}
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <p className="m-0">
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
              Location: {location || "Unknown Location"}
            </p>
          </div>
        </div>
        {/* 📸 Gallery Section */}
        {gallery.length > 0 && (
          <div className="GallerySection-style">
            <h2
              style={{ fontSize: "20px", fontWeight: "600", margin: "20px 0" }}
            >
              Gallery
            </h2>

            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={15}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 1000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              style={{ borderRadius: "12px" }}
            >
              {gallery.map((img, i) => (
                <SwiperSlide key={i}>
                  <div
                    style={{
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s",
                    }}
                    onClick={() => setLightboxIndex(i)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <img
                      src={img}
                      alt={`gallery-${i}`}
                      style={{
                        width: "100%",
                        height: "250px",
                        display: "block",
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {/* Event Details */}
        <div
          style={{
            fontSize: "14px",
            color: "#9ca3af",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        ></div>
      </div>

      {/* 🔍 Lightbox with navigation */}
      {lightboxIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          {/* Close */}
          <span
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              color: "white",
              fontSize: "30px",
              cursor: "pointer",
            }}
          >
            ✕
          </span>

          {/* Prev */}
          <span
            onClick={prevImage}
            style={{
              position: "absolute",
              left: "20px",
              color: "white",
              fontSize: "40px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ‹
          </span>

          {/* Image */}
          <img
            src={gallery[lightboxIndex]}
            alt="preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "12px",
            }}
          />

          {/* Next */}
          <span
            onClick={nextImage}
            style={{
              position: "absolute",
              right: "20px",
              color: "white",
              fontSize: "40px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ›
          </span>
        </div>
      )}
    </div>
  );
}
