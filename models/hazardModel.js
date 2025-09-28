import mongoose from "mongoose";
import { calculateCredibility } from "../utils/calculateCredibility.js";

const hazardSchema = new mongoose.Schema(
  {
    hazardType: {
      type: String,
      required: true,
      enum: [
        "Earthquake",
        "Flood",
        "Wildfire",
        "Tornado",
        "Landslide",
        "Tsunami",
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "moderate", "high", "severe"],
    },
    description: { type: String, required: true, maxlength: 1000 },

    // Store as mixed, normalize later
    location: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    tags: [
      { type: String, enum: ["help", "warning", "info", "fun"], required: true },
    ],
    images: [String],
    videos: [String],
    credibilityScore: {
      type: Number,
      default: function () {
        return calculateCredibility(this.severity);
      },
    },
    source: {
      type: String,
      default: "Citizen Report",
      enum: [
        "Citizen Report",
        "News Agency",
        "Sensor Data",
        "Drone Footage",
        "Ocean Buoy",
      ],
    },
    verified: { type: Boolean, default: false },
    reportedBy: { type: String, default: "Anonymous" },
  },
  { timestamps: true }
);

// Pre-validate hook: normalize string -> GeoJSON Point
hazardSchema.pre("validate", function (next) {
  if (typeof this.location === "string") {
    let loc = this.location.trim();

    // Remove extra quotes if present
    if ((loc.startsWith('"') && loc.endsWith('"')) || (loc.startsWith("'") && loc.endsWith("'"))) {
      loc = loc.slice(1, -1);
    }

    const parts = loc.split(",").map(v => v.trim()); // still strings here
    if (parts.length !== 2) return next(new Error("Invalid location format. Use 'lat,lng'"));

    // Convert to numbers at the very end
    const lat = +parts[0];
    const lng = +parts[1];

    if (!isFinite(lat) || !isFinite(lng)) return next(new Error("Invalid location numbers. Must be numeric lat,lng"));

    this.location = { type: "Point", coordinates: [lng, lat] }; // GeoJSON expects [lng, lat]
  }
  next();
});




const Hazard = mongoose.model("Hazard", hazardSchema);
export default Hazard;
