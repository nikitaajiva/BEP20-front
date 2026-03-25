"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import LedgerHistoryTable from "@/components/LedgerHistoryTable";
import { LEDGER_EVENT_TYPES } from "../../../constants/ledgerEventTypes";

const formatEventType = (type) => {
  if (!type) return "All Events";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function LedgerPageContent() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTypes, setEventTypes] = useState([]);

  const [filters, setFilters] = useState({
    eventType: searchParams.get("type") || "all",
    startDate: "",
    endDate: "",
  });

  // Fetch the available event types from the backend
  useEffect(() => {
    const fetchEventTypes = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/ledger/history/event-types", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event types");
        }

        const data = await response.json();

        if (data.success) {
          setEventTypes(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch event types:", err);
        // Do not block the UI for this, can default to manual entry or show a small error
      }
    };
    fetchEventTypes();
  }, [token]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      eventType: "all",
      startDate: "",
      endDate: "",
    });
  };

  const getFilterTitle = () => {
    if (filters.eventType === "all") return "All Transactions";
    return `${formatEventType(filters.eventType)} History`;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y py-4">
        <div className="text-center p-4" style={{ color: "#b3baff" }}>
          Loading page...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y py-4">
        <div
          className="alert alert-danger"
          style={{
            backgroundColor: "#450A0A",
            color: "#F9DADA",
            border: "1px solid #7F1D1D",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2
              className="fw-bold mb-3"
              style={{ color: "#fff", fontSize: "1.75rem" }}
            >
              {getFilterTitle()}
            </h2>
          </div>
        </div>

        <div
          className="card p-4 mb-4"
          style={{
            borderRadius: "16px",
            background: "#181f3a",
            border: "1px solid #2a3150",
            boxShadow: "0 4px 24px 0 rgba(16,25,53,0.16)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            <div>
              <label
                htmlFor="eventType"
                className="form-label mb-2"
                style={{ color: "#b3baff", fontWeight: 500 }}
              >
                Event Type
              </label>
              <select
                id="eventType"
                name="eventType"
                className="form-select"
                style={{
                  background: "#232b4a",
                  color: "#fff",
                  border: "1px solid #2a3150",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                }}
                value={filters.eventType}
                onChange={handleFilterChange}
              >
                <option value="all">All Event Types</option>
                {LEDGER_EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatEventType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="form-label mb-2"
                style={{ color: "#b3baff", fontWeight: 500 }}
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                style={{
                  background: "#232b4a",
                  color: "#fff",
                  border: "1px solid #2a3150",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                }}
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="form-label mb-2"
                style={{ color: "#b3baff", fontWeight: 500 }}
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                style={{
                  background: "#232b4a",
                  color: "#fff",
                  border: "1px solid #2a3150",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                }}
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="btn w-100"
                style={{
                  background: "rgba(79, 140, 255, 0.1)",
                  color: "#4f8cff",
                  border: "1px solid rgba(79, 140, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "0.75rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onClick={clearFilters}
              >
                <i className="ri-filter-off-line me-2"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div
          className="card p-4 mb-4"
          style={{
            borderRadius: "16px",
            background: "#181f3a",
            border: "1px solid #2a3150",
            boxShadow: "0 4px 24px 0 rgba(16,25,53,0.16)",
          }}
        >
          <h4
            className="fw-bold mb-4"
            style={{ fontSize: "1.25rem", color: "#fff" }}
          >
            Transaction History
          </h4>
          <LedgerHistoryTable filters={filters} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-xxl flex-grow-1 container-p-y py-4">
      <div className="text-center p-4" style={{ color: "#b3baff" }}>
        Loading ledger history...
      </div>
    </div>
  );
}
