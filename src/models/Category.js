import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
