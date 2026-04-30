import mongoose from "mongoose";

const InquiryReplySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Admin",
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    messageId: {
      type: String,
      default: "",
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const InquirySchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },
    productSlug: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    productVariantSlug: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    productTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    productImage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    company: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    sourcePath: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    language: {
      type: String,
      default: "en",
      trim: true,
      maxlength: 10,
    },
    status: {
      type: String,
      default: "new",
      enum: ["new", "replied", "archived"],
    },
    replies: {
      type: [InquiryReplySchema],
      default: [],
    },
    lastRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ email: 1, createdAt: -1 });
InquirySchema.index({ productSlug: 1, createdAt: -1 });

export const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);
