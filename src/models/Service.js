import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    service_name: {
      type: String,
      required: true,
      trim: true,
    },
    apikey: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "service_collection",
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
