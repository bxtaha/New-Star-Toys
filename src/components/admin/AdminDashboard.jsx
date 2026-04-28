"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Eye,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Newspaper,
  Package,
  Pencil,
  Plus,
  Star,
  Tags,
  Trash2,
  Upload,
  UserRound,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyAdminForm = {
  name: "",
  email: "",
  password: "",
};

const emptyCategoryForm = {
  name: "",
};

const createEmptyProductForm = () => ({
  id: null,
  title: "",
  slug: "",
  categories: [],
  featuredLabel: "",
  showInCollection: true,
  isFeatured: false,
  coverImage: "",
  media: [],
  description: "",
  moq: "",
  details: "",
  featuresText: "",
  specsText: "",
});

const createEmptyBlogForm = () => ({
  id: null,
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  shortExcerpt: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  readTime: "",
  coverImage: "",
  contentText: "",
});

function productToForm(product) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    categories: product.categories || (product.category ? [product.category] : []),
    featuredLabel: product.featuredLabel || "",
    showInCollection: Boolean(product.showInCollection),
    isFeatured: Boolean(product.isFeatured),
    coverImage: product.coverImage || "",
    media: product.media || [],
    description: product.description,
    moq: product.moq,
    details: product.details,
    featuresText: (product.features || []).join("\n"),
    specsText: (product.specs || []).map((item) => `${item.label}: ${item.value}`).join("\n"),
  };
}

function blogToForm(blog) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    excerpt: blog.excerpt,
    shortExcerpt: blog.shortExcerpt || "",
    publishedAt: blog.publishedAt,
    readTime: blog.readTime || "",
    coverImage: blog.coverImage || "",
    contentText: (blog.content || []).join("\n\n"),
  };
}

function parseLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecs(value) {
  return String(value || "")
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label?.trim(),
        value: rest.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);
}

function parseParagraphs(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

const AdminDashboard = ({ currentAdmin, initialAdmins, initialProducts, initialBlogs, initialCategories }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [admins, setAdmins] = useState(initialAdmins);
  const [products, setProducts] = useState(initialProducts);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [categories, setCategories] = useState(initialCategories);

  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [productForm, setProductForm] = useState(createEmptyProductForm());
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productUploading, setProductUploading] = useState(false);

  const [blogForm, setBlogForm] = useState(createEmptyBlogForm());
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogUploading, setBlogUploading] = useState(false);

  const stats = useMemo(() => {
    const featuredCount = products.filter((product) => product.isFeatured).length;
    const collectionCount = products.filter((product) => product.showInCollection).length;
    const totalComments = blogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0);

    return {
      admins: admins.length,
      categories: categories.length,
      products: products.length,
      featuredProducts: featuredCount,
      collectionProducts: collectionCount,
      blogs: blogs.length,
      comments: totalComments,
    };
  }, [admins, categories, products, blogs]);

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "admins", label: "Admins", icon: UserRound },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "products", label: "Products", icon: Package },
    { id: "blogs", label: "Blogs", icon: Newspaper },
  ];

  const resetAdminForm = () => {
    setAdminForm(emptyAdminForm);
    setEditingAdminId(null);
  };

  const resetProductForm = () => {
    setProductForm(createEmptyProductForm());
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const resetBlogForm = () => {
    setBlogForm(createEmptyBlogForm());
  };

  const refreshAdmins = async () => {
    const response = await fetch("/api/admin/admins");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load admins.");
    }

    setAdmins(data.admins);
  };

  const refreshProducts = async () => {
    const response = await fetch("/api/admin/products");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load products.");
    }

    setProducts(data.products);
  };

  const refreshBlogs = async () => {
    const response = await fetch("/api/admin/blogs");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load blogs.");
    }

    setBlogs(data.blogs);
  };

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load categories.");
    }

    setCategories(data.categories);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin";
    } catch {
      window.location.href = "/admin";
    }
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setAdminSubmitting(true);

    try {
      const url = editingAdminId ? `/api/admin/admins/${editingAdminId}` : "/api/admin/admins";
      const method = editingAdminId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save admin.");
      }

      await refreshAdmins();
      resetAdminForm();
      toast.success(editingAdminId ? "Admin updated" : "Admin created");
    } catch (error) {
      toast.error(error.message || "Unable to save admin.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const shouldDelete = window.confirm("Delete this admin account?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete admin.");
      }

      await refreshAdmins();
      if (editingAdminId === adminId) {
        resetAdminForm();
      }
      toast.success("Admin deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete admin.");
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setCategorySubmitting(true);

    try {
      const url = editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : "/api/admin/categories";
      const method = editingCategoryId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save category.");
      }

      const previousName = categories.find((category) => category.id === editingCategoryId)?.name;
      await Promise.all([refreshCategories(), refreshProducts()]);
      if (editingCategoryId && previousName && previousName !== data.category.name) {
        setProductForm((previous) => ({
          ...previous,
          categories: previous.categories.map((item) => (item === previousName ? data.category.name : item)),
        }));
      }
      resetCategoryForm();
      toast.success(editingCategoryId ? "Category updated" : "Category created");
    } catch (error) {
      toast.error(error.message || "Unable to save category.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const shouldDelete = window.confirm("Delete this category?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete category.");
      }

      await refreshCategories();
      if (editingCategoryId === categoryId) {
        resetCategoryForm();
      }
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete category.");
    }
  };

  const uploadFiles = async ({ type, files, entitySlug }) => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("entitySlug", entitySlug || "shared");

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed.");
    }

    return data.files || [];
  };

  const handleProductCoverUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setProductUploading(true);

    try {
      const uploaded = await uploadFiles({
        type: "products",
        files,
        entitySlug: productForm.slug || productForm.title || "product",
      });

      const firstFile = uploaded[0];
      if (!firstFile) {
        throw new Error("No file was uploaded.");
      }

      setProductForm((previous) => ({
        ...previous,
        coverImage: firstFile.url,
        media: previous.media.some((item) => item.url === firstFile.url)
          ? previous.media
          : [firstFile, ...previous.media],
      }));
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setProductUploading(false);
      event.target.value = "";
    }
  };

  const handleProductMediaUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setProductUploading(true);

    try {
      const uploaded = await uploadFiles({
        type: "products",
        files,
        entitySlug: productForm.slug || productForm.title || "product",
      });

      setProductForm((previous) => {
        const nextMedia = [...previous.media];
        uploaded.forEach((file) => {
          if (!nextMedia.some((item) => item.url === file.url)) {
            nextMedia.push(file);
          }
        });

        return {
          ...previous,
          media: nextMedia,
          coverImage: previous.coverImage || uploaded[0]?.url || "",
        };
      });
      toast.success("Media uploaded");
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setProductUploading(false);
      event.target.value = "";
    }
  };

  const handleBlogCoverUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setBlogUploading(true);

    try {
      const uploaded = await uploadFiles({
        type: "blogs",
        files,
        entitySlug: blogForm.slug || blogForm.title || "blog",
      });

      const firstFile = uploaded[0];
      if (!firstFile) {
        throw new Error("No file was uploaded.");
      }

      setBlogForm((previous) => ({
        ...previous,
        coverImage: firstFile.url,
      }));
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setBlogUploading(false);
      event.target.value = "";
    }
  };

  const toggleProductCategory = (categoryName) => {
    setProductForm((previous) => ({
      ...previous,
      categories: previous.categories.includes(categoryName)
        ? previous.categories.filter((item) => item !== categoryName)
        : [...previous.categories, categoryName],
    }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setProductSubmitting(true);

    try {
      const payload = {
        title: productForm.title,
        slug: productForm.slug,
        categories: productForm.categories,
        featuredLabel: productForm.featuredLabel,
        showInCollection: productForm.showInCollection,
        isFeatured: productForm.isFeatured,
        coverImage: productForm.coverImage,
        media: productForm.media,
        description: productForm.description,
        moq: productForm.moq,
        details: productForm.details,
        features: parseLines(productForm.featuresText),
        specs: parseSpecs(productForm.specsText),
      };

      const url = productForm.id ? `/api/admin/products/${productForm.id}` : "/api/admin/products";
      const method = productForm.id ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save product.");
      }

      await refreshProducts();
      resetProductForm();
      toast.success(productForm.id ? "Product updated" : "Product created");
    } catch (error) {
      toast.error(error.message || "Unable to save product.");
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const shouldDelete = window.confirm("Delete this product?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete product.");
      }

      await refreshProducts();
      if (productForm.id === productId) {
        resetProductForm();
      }
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete product.");
    }
  };

  const handleBlogSubmit = async (event) => {
    event.preventDefault();
    setBlogSubmitting(true);

    try {
      const payload = {
        title: blogForm.title,
        slug: blogForm.slug,
        category: blogForm.category,
        excerpt: blogForm.excerpt,
        shortExcerpt: blogForm.shortExcerpt,
        publishedAt: blogForm.publishedAt,
        readTime: blogForm.readTime,
        coverImage: blogForm.coverImage,
        content: parseParagraphs(blogForm.contentText),
      };

      const url = blogForm.id ? `/api/admin/blogs/${blogForm.id}` : "/api/admin/blogs";
      const method = blogForm.id ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save blog.");
      }

      await refreshBlogs();
      resetBlogForm();
      toast.success(blogForm.id ? "Blog updated" : "Blog created");
    } catch (error) {
      toast.error(error.message || "Unable to save blog.");
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    const shouldDelete = window.confirm("Delete this blog?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete blog.");
      }

      await refreshBlogs();
      if (blogForm.id === blogId) {
        resetBlogForm();
      }
      toast.success("Blog deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete blog.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-border bg-card/60 px-6 py-8">
          <div className="rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">YCNST</p>
            <h1 className="mt-3 text-2xl font-heading font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-white/75">Manage admins, products, blogs, likes, comments, and uploads.</p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Signed in as</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{currentAdmin.name}</p>
                <p className="text-sm text-muted-foreground">{currentAdmin.email}</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 grid gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <Button variant="outline" className="mt-8 w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </aside>

        <main className="px-6 py-8 md:px-10">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground">
                {navigationItems.find((item) => item.id === activeTab)?.label || "Overview"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Update MongoDB-backed content and keep the public site synchronized.
              </p>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: "Admin Accounts", value: stats.admins, icon: UserRound },
                  { label: "Categories", value: stats.categories, icon: Tags },
                  { label: "All Products", value: stats.products, icon: Package },
                  { label: "Featured Projects", value: stats.featuredProducts, icon: Star },
                  { label: "Collection Products", value: stats.collectionProducts, icon: Eye },
                  { label: "Blog Posts", value: stats.blogs, icon: Newspaper },
                  { label: "Blog Comments", value: stats.comments, icon: Check },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="mt-4 text-4xl font-heading font-bold text-foreground">{item.value}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-6">
                  <h3 className="text-xl font-heading font-semibold text-foreground">Featured products</h3>
                  <div className="mt-5 grid gap-4">
                    {products
                      .filter((product) => product.isFeatured)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                          <div>
                            <p className="font-semibold text-foreground">{product.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.featuredLabel || product.categories?.join(", ") || product.category}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab("products");
                              setProductForm(productToForm(product));
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6">
                  <h3 className="text-xl font-heading font-semibold text-foreground">Recent blogs</h3>
                  <div className="mt-5 grid gap-4">
                    {blogs.slice(0, 5).map((blog) => (
                      <div key={blog.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                        <div>
                          <p className="font-semibold text-foreground">{blog.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {blog.category} · {blog.comments.length} comments
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("blogs");
                            setBlogForm(blogToForm(blog));
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">Admin accounts</h3>
                  <Button variant="outline" size="sm" onClick={resetAdminForm}>
                    <Plus className="h-4 w-4" />
                    New Admin
                  </Button>
                </div>

                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAdminId(admin.id);
                              setAdminForm({
                                name: admin.name,
                                email: admin.email,
                                password: "",
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={admin.id === currentAdmin.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">
                    {editingAdminId ? "Edit admin" : "Create admin"}
                  </h3>
                  {editingAdminId && (
                    <Button type="button" variant="ghost" size="sm" onClick={resetAdminForm}>
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input
                      value={adminForm.name}
                      onChange={(event) => setAdminForm((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="Admin name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      value={adminForm.email}
                      onChange={(event) => setAdminForm((previous) => ({ ...previous, email: event.target.value }))}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Password {editingAdminId ? "(leave blank to keep current)" : ""}
                    </label>
                    <Input
                      type="password"
                      value={adminForm.password}
                      onChange={(event) => setAdminForm((previous) => ({ ...previous, password: event.target.value }))}
                      placeholder="Strong password"
                      required={!editingAdminId}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" disabled={adminSubmitting}>
                  {adminSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAdminId ? "Update Admin" : "Create Admin"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">Categories</h3>
                  <Button variant="outline" size="sm" onClick={resetCategoryForm}>
                    <Plus className="h-4 w-4" />
                    New Category
                  </Button>
                </div>

                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setCategoryForm({
                                name: category.name,
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCategorySubmit} className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">
                    {editingCategoryId ? "Edit category" : "Create category"}
                  </h3>
                  {editingCategoryId && (
                    <Button type="button" variant="ghost" size="sm" onClick={resetCategoryForm}>
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category name</label>
                    <Input
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm({ name: event.target.value })}
                      placeholder="Stuffed Animals"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Products can then select one or more of these categories from the product form.
                  </p>
                </div>

                <Button type="submit" className="mt-6 w-full" disabled={categorySubmitting}>
                  {categorySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCategoryId ? "Update Category" : "Create Category"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "products" && (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">Products</h3>
                  <Button variant="outline" size="sm" onClick={resetProductForm}>
                    <Plus className="h-4 w-4" />
                    New Product
                  </Button>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{product.title}</p>
                            {product.isFeatured && (
                              <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                                Featured
                              </span>
                            )}
                            {product.showInCollection && (
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                Collection
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{(product.categories || []).join(", ") || product.category}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setProductForm(productToForm(product))}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleProductSubmit} className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">
                    {productForm.id ? "Edit product" : "Create product"}
                  </h3>
                  {productForm.id && (
                    <Button type="button" variant="ghost" size="sm" onClick={resetProductForm}>
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Title</label>
                      <Input
                        value={productForm.title}
                        onChange={(event) => setProductForm((previous) => ({ ...previous, title: event.target.value }))}
                        placeholder="Pink Fantasy Plush"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Slug</label>
                      <Input
                        value={productForm.slug}
                        onChange={(event) => setProductForm((previous) => ({ ...previous, slug: event.target.value }))}
                        placeholder="pink-fantasy-plush"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Categories</label>
                      <div className="rounded-2xl border border-border p-4">
                        {categories.length > 0 ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {categories.map((category) => (
                              <label
                                key={category.id}
                                className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-foreground"
                              >
                                <input
                                  type="checkbox"
                                  checked={productForm.categories.includes(category.name)}
                                  onChange={() => toggleProductCategory(category.name)}
                                />
                                {category.name}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Create categories first to assign them to products.</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">MOQ</label>
                      <Input
                        value={productForm.moq}
                        onChange={(event) => setProductForm((previous) => ({ ...previous, moq: event.target.value }))}
                        placeholder="2,000 pcs"
                        required
                      />
                    </div>
                  </div>

                  {productForm.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {productForm.categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={productForm.showInCollection}
                        onChange={(event) =>
                          setProductForm((previous) => ({
                            ...previous,
                            showInCollection: event.target.checked,
                          }))
                        }
                      />
                      Show in collection
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(event) =>
                          setProductForm((previous) => ({
                            ...previous,
                            isFeatured: event.target.checked,
                          }))
                        }
                      />
                      Featured project
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Featured label</label>
                    <Input
                      value={productForm.featuredLabel}
                      onChange={(event) => setProductForm((previous) => ({ ...previous, featuredLabel: event.target.value }))}
                      placeholder="Custom OEM"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Short description</label>
                    <Textarea
                      value={productForm.description}
                      onChange={(event) => setProductForm((previous) => ({ ...previous, description: event.target.value }))}
                      rows={3}
                      placeholder="Short summary for cards and lists."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Detailed description</label>
                    <Textarea
                      value={productForm.details}
                      onChange={(event) => setProductForm((previous) => ({ ...previous, details: event.target.value }))}
                      rows={5}
                      placeholder="Detailed description shown on the product page."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Features</label>
                    <Textarea
                      value={productForm.featuresText}
                      onChange={(event) => setProductForm((previous) => ({ ...previous, featuresText: event.target.value }))}
                      rows={6}
                      placeholder={"One feature per line"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Specifications</label>
                    <Textarea
                      value={productForm.specsText}
                      onChange={(event) => setProductForm((previous) => ({ ...previous, specsText: event.target.value }))}
                      rows={5}
                      placeholder={"Size: 28 cm / 11 inches\nMaterial: Velboa plush"}
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">Cover image</p>
                        <p className="text-sm text-muted-foreground">Upload the primary image for cards and detail pages.</p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {productUploading ? "Uploading..." : "Upload cover"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleProductCoverUpload} />
                      </label>
                    </div>

                    {productForm.coverImage && (
                      <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{productForm.coverImage}</div>
                    )}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">Product media</p>
                        <p className="text-sm text-muted-foreground">Upload extra images or videos. Files are stored in the public folder.</p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {productUploading ? "Uploading..." : "Upload media"}
                        <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleProductMediaUpload} />
                      </label>
                    </div>

                    <div className="grid gap-3">
                      {productForm.media.map((item) => (
                        <div key={item.url} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {item.kind === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.kind === "video" ? "Video" : "Image"}</p>
                              <p className="max-w-[220px] truncate text-xs text-muted-foreground">{item.url}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {item.kind === "image" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setProductForm((previous) => ({ ...previous, coverImage: item.url }))}
                              >
                                Set Cover
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setProductForm((previous) => {
                                  const nextMedia = previous.media.filter((mediaItem) => mediaItem.url !== item.url);
                                  return {
                                    ...previous,
                                    media: nextMedia,
                                    coverImage:
                                      previous.coverImage === item.url ? nextMedia.find((mediaItem) => mediaItem.kind === "image")?.url || "" : previous.coverImage,
                                  };
                                })
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" disabled={productSubmitting}>
                  {productSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : productForm.id ? "Update Product" : "Create Product"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "blogs" && (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">Blog posts</h3>
                  <Button variant="outline" size="sm" onClick={resetBlogForm}>
                    <Plus className="h-4 w-4" />
                    New Blog
                  </Button>
                </div>

                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{blog.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {blog.category} · {blog.publishedAt} · {blog.comments.length} comments
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{blog.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setBlogForm(blogToForm(blog))}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteBlog(blog.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {blog.comments.length > 0 && (
                        <div className="mt-4 rounded-2xl bg-muted/60 p-4">
                          <p className="text-sm font-medium text-foreground">Recent comments</p>
                          <div className="mt-3 grid gap-3">
                            {blog.comments.slice(0, 2).map((comment) => (
                              <div key={comment.id} className="rounded-xl border border-border bg-background px-4 py-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-foreground">{comment.name}</p>
                                  <p className="text-xs text-muted-foreground">{comment.date}</p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleBlogSubmit} className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-semibold text-foreground">
                    {blogForm.id ? "Edit blog" : "Create blog"}
                  </h3>
                  {blogForm.id && (
                    <Button type="button" variant="ghost" size="sm" onClick={resetBlogForm}>
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Title</label>
                      <Input
                        value={blogForm.title}
                        onChange={(event) => setBlogForm((previous) => ({ ...previous, title: event.target.value }))}
                        placeholder="2026 Plush Toy Trends"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Slug</label>
                      <Input
                        value={blogForm.slug}
                        onChange={(event) => setBlogForm((previous) => ({ ...previous, slug: event.target.value }))}
                        placeholder="2026-plush-toy-trends"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category</label>
                      <Input
                        value={blogForm.category}
                        onChange={(event) => setBlogForm((previous) => ({ ...previous, category: event.target.value }))}
                        placeholder="Trends"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Publish date</label>
                      <Input
                        type="date"
                        value={blogForm.publishedAt}
                        onChange={(event) => setBlogForm((previous) => ({ ...previous, publishedAt: event.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Read time</label>
                      <Input
                        value={blogForm.readTime}
                        onChange={(event) => setBlogForm((previous) => ({ ...previous, readTime: event.target.value }))}
                        placeholder="5 min read"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Cover image</label>
                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
                        <span className="inline-flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {blogUploading ? "Uploading..." : "Upload cover image"}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleBlogCoverUpload} />
                      </label>
                    </div>
                  </div>

                  {blogForm.coverImage && (
                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{blogForm.coverImage}</div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Excerpt</label>
                    <Textarea
                      value={blogForm.excerpt}
                      onChange={(event) => setBlogForm((previous) => ({ ...previous, excerpt: event.target.value }))}
                      rows={3}
                      placeholder="Summary shown on cards and blog lists."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Short excerpt</label>
                    <Textarea
                      value={blogForm.shortExcerpt}
                      onChange={(event) => setBlogForm((previous) => ({ ...previous, shortExcerpt: event.target.value }))}
                      rows={2}
                      placeholder="Optional shorter teaser."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Content</label>
                    <Textarea
                      value={blogForm.contentText}
                      onChange={(event) => setBlogForm((previous) => ({ ...previous, contentText: event.target.value }))}
                      rows={12}
                      placeholder={"Separate paragraphs with a blank line."}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" disabled={blogSubmitting}>
                  {blogSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : blogForm.id ? "Update Blog" : "Create Blog"}
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
