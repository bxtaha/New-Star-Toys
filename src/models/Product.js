import mongoose from "mongoose";

const ProductMediaSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    variantSlug: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  { _id: false },
);

const ProductVariantSchema = new mongoose.Schema(
  {
    colorName: {
      type: String,
      required: true,
      trim: true,
    },
    colorHex: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false },
);

const ProductSpecSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    title: {
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
    category: {
      type: String,
      default: "",
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    featuredLabel: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    showInCollection: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    media: {
      type: [ProductMediaSchema],
      default: [],
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    moq: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: [], zh: [] }),
    },
    specs: {
      type: [
        new mongoose.Schema(
          {
            label: { type: mongoose.Schema.Types.Mixed, default: () => ({ en: "", zh: "" }) },
            value: { type: mongoose.Schema.Types.Mixed, default: () => ({ en: "", zh: "" }) },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
