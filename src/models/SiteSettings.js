import mongoose from "mongoose";

const I18nStringSchema = new mongoose.Schema(
  {
    en: { type: String, default: "", trim: true },
    zh: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    heroImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    heroTitle: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    heroSubtitle: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    heroImages: {
      type: [String],
      default: [],
    },
    heroPages: {
      type: [
        {
          key: { type: String, required: true, trim: true },
          title: { type: mongoose.Schema.Types.Mixed, default: () => ({ en: "", zh: "" }) },
          subtitle: { type: mongoose.Schema.Types.Mixed, default: () => ({ en: "", zh: "" }) },
          imageUrl: { type: String, default: "", trim: true },
          images: { type: [String], default: [] },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
