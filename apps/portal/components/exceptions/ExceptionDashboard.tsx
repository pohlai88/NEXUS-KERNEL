/**
 * Exception-First Dashboard
 *
 * PRD A-01: Exception-First Workload
 * - Shows only problems, not volume
 * - Severity tagging: 🔴 Blocking, 🟠 Needs action, 🟢 Safe
 */

"use client";

import {
  getExceptionsAction,
  getExceptionSummaryAction,
} from "@/app/exceptions/actions";
import { useEffect, useState } from "react";

interface Exception {
  id: string;
  invoice_id: string;
  exception_type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "ignored";
  title: string;
  description: string;
  detected_at: string;
}

interface ExceptionSummary {
  total: number;
  blocking: number;
  needs_action: number;
  safe: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export function ExceptionDashboard() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [summary, setSummary] = useState<ExceptionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  type FilterType = "all" | "open" | "critical" | "high" | "medium" | "low";
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setIsLoading(true);
    console.log("[ExceptionDashboard] loadData START");
    try {
      // Add timeout of 10 seconds to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Server action timeout after 10s")),
          10000
        )
      );

      console.log("[ExceptionDashboard] Calling Promise.all with timeout...");
      const [exceptionsResult, summaryResult] = await Promise.race([
        Promise.all([
          getExceptionsAction(
            filter === "all"
              ? undefined
              : {
                  status: filter === "open" ? "open" : undefined,
                  severity: !["all", "open"].includes(filter)
                    ? (filter as "critical" | "high" | "medium" | "low")
                    : undefined,
                }
          ),
          getExceptionSummaryAction(),
        ]),
        timeoutPromise as any,
      ]);

      console.log("[ExceptionDashboard] Got results:", {
        exceptionsResult,
        summaryResult,
      });
      if (exceptionsResult?.success) {
        setExceptions(exceptionsResult.exceptions || []);
      } else if (exceptionsResult?.error) {
        console.error(
          "[ExceptionDashboard] Exceptions error:",
          exceptionsResult.error
        );
        setExceptions([]);
      }
      if (summaryResult?.success) {
        setSummary(summaryResult.summary);
      } else if (summaryResult?.error) {
        console.error(
          "[ExceptionDashboard] Summary error:",
          summaryResult.error
        );
        setSummary(null);
      }
    } catch (error) {
      console.error("[ExceptionDashboard] ERROR:", error);
      // Graceful error handling - empty state will show
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "🔴";
      case "medium":
        return "🟠";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "Blocking";
      case "medium":
        return "Needs Action";
      case "low":
        return "Safe";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="na-card na-p-6">
        <p className="na-metadata">Loading exceptions...</p>
      </div>
    );
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Exception Dashboard</h1>
        <button onClick={loadData} className="na-btn na-btn-ghost">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="na-grid na-grid-cols-4 na-gap-4 na-mb-6">
          <div className="na-card na-p-4">
            <div className="na-metadata">Total Exceptions</div>
            <div className="na-data-large">{summary.total}</div>
          </div>
          <div className="na-card na-p-4 na-bg-danger-subtle">
            <div className="na-metadata">🔴 Blocking</div>
            <div className="na-data-large">{summary.blocking}</div>
          </div>
          <div className="na-card na-p-4 na-bg-warn-subtle">
            <div className="na-metadata">🟠 Needs Action</div>
            <div className="na-data-large">{summary.needs_action}</div>
          </div>
          <div className="na-card na-p-4 na-bg-ok-subtle">
            <div className="na-metadata">🟢 Safe</div>
            <div className="na-data-large">{summary.safe}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="na-card na-p-4 na-mb-6">
        <div className="na-flex na-gap-2 na-flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`na-btn ${
              filter === "all" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`na-btn ${
              filter === "open" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            Open Only
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`na-btn ${
              filter === "critical" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            🔴 Critical
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`na-btn ${
              filter === "high" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            🔴 High
          </button>
          <button
            onClick={() => setFilter("medium")}
            className={`na-btn ${
              filter === "medium" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            🟠 Medium
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`na-btn ${
              filter === "low" ? "na-btn-primary" : "na-btn-ghost"
            }`}
          >
            🟢 Low
          </button>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="na-space-y-4">
        {exceptions.length === 0 ? (
          <div className="na-card na-p-6 na-text-center">
            <p className="na-h4">No Exceptions Found</p>
            <p className="na-body na-mt-2">
              All invoices are in good standing!
            </p>
          </div>
        ) : (
          exceptions.map((exception) => (
            <div
              key={exception.id}
              className="na-card na-p-4 na-border-l-4"
              style={{
                borderLeftColor:
                  exception.severity === "critical" ||
                  exception.severity === "high"
                    ? "var(--color-danger)"
                    : exception.severity === "medium"
                    ? "var(--color-warn)"
                    : "var(--color-ok)",
              }}
            >
              <div className="na-flex na-items-start na-justify-between na-mb-2">
                <div className="na-flex na-items-center na-gap-2">
                  <span className="na-text-2xl">
                    {getSeverityIcon(exception.severity)}
                  </span>
                  <div>
                    <h3 className="na-h5">{exception.title}</h3>
                    <p className="na-metadata na-text-sm">
                      {getSeverityLabel(exception.severity)} •{" "}
                      {exception.exception_type}
                    </p>
                  </div>
                </div>
                <span
                  className={`na-status na-status-${
                    exception.status === "open"
                      ? "pending"
                      : exception.status === "resolved"
                      ? "ok"
                      : "warn"
                  }`}
                >
                  {exception.status}
                </span>
              </div>
              <p className="na-body na-mb-2">{exception.description}</p>
              <div className="na-flex na-items-center na-justify-between">
                <p className="na-metadata na-text-sm">
                  Detected: {new Date(exception.detected_at).toLocaleString()}
                </p>
                <a
                  href={`/invoices/${exception.invoice_id}`}
                  className="na-btn na-btn-ghost na-text-sm"
                >
                  View Invoice →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
