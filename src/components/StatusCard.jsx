/**
 * StatusCard.jsx  ─ Lab 3, Task 1: Reusable Component #3 (bonus)
 * ──────────────────────────────────────────────────────────────
 * A small statistics/info pill displayed in the Dashboard header.
 * Accepts all data via props, making it fully reusable.
 *
 * Props:
 *   icon   {string}  – emoji or char for the icon background
 *   label  {string}  – small uppercase label
 *   value  {string}  – bold primary value
 *   color  {string}  – CSS color for the icon background (optional)
 * ──────────────────────────────────────────────────────────────
 */

import React from 'react';

const StatusCard = ({ icon, label, value, color = "rgba(168,85,247,0.18)" }) => {
    return (
        <div className="status-card">
            {/* Icon badge — color is injected via the `color` prop */}
            <div
                className="sc-icon"
                style={{ background: color }}
                aria-hidden="true"
            >
                {icon}
            </div>

            {/* Text content */}
            <div>
                <p className="sc-label">{label}</p>
                <p className="sc-value">{value}</p>
            </div>
        </div>
    );
};

export default StatusCard;
