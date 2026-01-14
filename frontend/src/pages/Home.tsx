import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import type { ProductsResponse, SearchParams, Category } from "../types";
import { useAuth } from "../hooks";
import { Input, Select, Checkbox, Button } from "../components";

const STOCK_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "In Stock" },
  { value: "false", label: "Out of Stock" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
  { value: "created_at", label: "Newest" },
  { value: "relevance", label: "Relevance" },
];

const SORT_METHOD_OPTIONS = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export const Home = () => {
  const { logout, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") || "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    searchParams.getAll("category").map(Number).filter(Boolean),
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [sortMethod, setSortMethod] = useState(
    searchParams.get("method") || "desc",
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient<{ data: Category[] }>("/api/categories");
      return response.data;
    },
    staleTime: Infinity,
  });

  // Build query params
  const buildQueryParams = (): SearchParams => {
    const params: SearchParams = { page, pageSize: 12 };
    if (search) params.q = search;
    if (minPrice) params.minPrice = Number(minPrice);
    if (maxPrice) params.maxPrice = Number(maxPrice);
    if (inStock) params.inStock = inStock === "true";
    if (selectedCategories.length > 0) params.category = selectedCategories;
    if (sort) params.sort = sort as SearchParams["sort"];
    if (sortMethod) params.method = sortMethod as SearchParams["method"];
    return params;
  };

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", buildQueryParams()],
    queryFn: async () => {
      const params = buildQueryParams();
      const queryString = new URLSearchParams();

      if (params.page) queryString.set("page", params.page.toString());
      if (params.pageSize)
        queryString.set("pageSize", params.pageSize.toString());
      if (params.q) queryString.set("q", params.q);
      if (params.minPrice)
        queryString.set("minPrice", params.minPrice.toString());
      if (params.maxPrice)
        queryString.set("maxPrice", params.maxPrice.toString());
      if (params.inStock !== undefined)
        queryString.set("inStock", params.inStock.toString());
      if (params.category) {
        params.category.forEach((cat) =>
          queryString.append("category", cat.toString()),
        );
      }
      if (params.sort) queryString.set("sort", params.sort);
      if (params.method) queryString.set("method", params.method);

      return apiClient<ProductsResponse>(
        `/api/products?${queryString.toString()}`,
      );
    },
  });

  // Update URL when filters change
  const updateURL = (newPage: number = 1) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", inStock);
    selectedCategories.forEach((cat) =>
      params.append("category", cat.toString()),
    );
    if (sort) params.set("sort", sort);
    if (sortMethod) params.set("method", sortMethod);
    if (newPage > 1) params.set("page", newPage.toString());
    setSearchParams(params);
    setPage(newPage);
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  const handleApplyFilters = () => {
    updateURL(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setInStock("");
    setSelectedCategories([]);
    setSort("");
    setSortMethod("desc");
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    updateURL(newPage);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Product Search</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <Button onClick={logout} variant="danger" className="logout-btn">
            Logout
          </Button>
        </div>
      </header>

      <div className="home-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h2>Filters</h2>

          {/* Search */}
          <Input
            type="text"
            label="Search"
            value={search}
            onChange={setSearch}
            placeholder="Search products..."
          />

          {/* Price Range */}
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <Input
                type="number"
                value={minPrice}
                onChange={setMinPrice}
                placeholder="Min"
              />
              <span>-</span>
              <Input
                type="number"
                value={maxPrice}
                onChange={setMaxPrice}
                placeholder="Max"
              />
            </div>
          </div>

          {/* In Stock */}
          <Select
            label="Availability"
            value={inStock}
            onChange={setInStock}
            options={STOCK_OPTIONS}
          />

          {/* Categories */}
          <div className="filter-group">
            <label>Categories</label>
            <div className="category-list">
              {categoriesData?.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.name}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
              ))}
            </div>
          </div>

          {/* Sort */}
          <Select
            label="Sort By"
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
          />

          <Select
            label="Sort Order"
            value={sortMethod}
            onChange={setSortMethod}
            options={SORT_METHOD_OPTIONS}
          />

          <div className="filter-actions">
            <Button onClick={handleApplyFilters} variant="primary">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="secondary">
              Clear All
            </Button>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="products-main">
          {isLoading && (
            <div className="loading-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          )}

          {error && (
            <div className="error-message">
              Failed to load products. Please try again.
            </div>
          )}

          {!isLoading && !error && productsData?.data.length === 0 && (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {!isLoading &&
            !error &&
            productsData &&
            productsData.data.length > 0 && (
              <>
                <p className="results-count">
                  Showing {productsData.data.length} of{" "}
                  {productsData.pagination.total} products
                </p>
                <div className="products-grid">
                  {productsData.data.map((product) => (
                    <Link
                      to={`/product/${product.id}`}
                      key={product.id}
                      className="product-card"
                    >
                      <div className="product-image">
                        {product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-price">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="product-rating">
                          Rating: {product.rating.toFixed(1)}
                        </p>
                        <span
                          className={`stock-badge ${product.inStock ? "in-stock" : "out-of-stock"}`}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <Button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <span>
                    Page {productsData.pagination.page} of{" "}
                    {productsData.pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= productsData.pagination.totalPages}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
        </main>
      </div>
    </div>
  );
};
