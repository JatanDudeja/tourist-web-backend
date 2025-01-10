import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    place: {
        type: String,
        required: true
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tourSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
