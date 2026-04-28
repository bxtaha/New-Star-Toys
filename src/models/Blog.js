import mongoose from "mongoose";

const BlogCommentReplySchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const BlogCommentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: {
      type: [BlogCommentReplySchema],
      default: [],
    },
  },
  { _id: true },
);

const BlogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    excerpt: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    shortExcerpt: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: "", zh: "" }),
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    readTime: {
      type: String,
      required: true,
      trim: true,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ en: [], zh: [] }),
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: {
      type: [BlogCommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
