import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import type { ProductsResponse, SearchParams, Category } from "../types";
import { Button, Header } from "../components";

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

const PAGE_SIZE_OPTIONS = [
  { value: "20", label: "20" },
  { value: "40", label: "40" },
  { value: "60", label: "60" },
  { value: "80", label: "80" },
  { value: "100", label: "100" },
];

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read state from URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") || "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    searchParams.getAll("category").map(Number).filter(Boolean)
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [sortMethod, setSortMethod] = useState(
    searchParams.get("method") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 20
  );

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
    const params: SearchParams = { page, pageSize };
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
          queryString.append("category", cat.toString())
        );
      }
      if (params.sort) queryString.set("sort", params.sort);
      if (params.method) queryString.set("method", params.method);

      return apiClient<ProductsResponse>(
        `/api/products?${queryString.toString()}`
      );
    },
  });

  // Update URL when filters change
  const updateURL = (newPage: number = 1, newPageSize: number = pageSize) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", inStock);
    selectedCategories.forEach((cat) =>
      params.append("category", cat.toString())
    );
    if (sort) params.set("sort", sort);
    if (sortMethod) params.set("method", sortMethod);
    if (newPageSize !== 20) params.set("pageSize", newPageSize.toString());
    if (newPage > 1) params.set("page", newPage.toString());
    setSearchParams(params);
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  // Auto-apply filters when any filter changes (with debounce for text inputs)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (inStock) params.set("inStock", inStock);
      selectedCategories.forEach((cat) =>
        params.append("category", cat.toString())
      );
      if (sort) params.set("sort", sort);
      if (sortMethod) params.set("method", sortMethod);
      if (pageSize !== 20) params.set("pageSize", pageSize.toString());
      // Reset to page 1 when filters change
      setPage(1);
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, minPrice, maxPrice, inStock, selectedCategories, sort, sortMethod]);

  const handleClearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setInStock("");
    setSelectedCategories([]);
    setSort("");
    setSortMethod("desc");
    setPage(1);
    setPageSize(20);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize);
    updateURL(1, size); // Reset to page 1 when changing page size
  };

  const activeFiltersCount = [
    search,
    minPrice,
    maxPrice,
    inStock,
    selectedCategories.length > 0,
    sort,
  ].filter(Boolean).length;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-6">
          {/* 12-column grid: 3 for filters, 9 for products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Mobile filter button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Filters Panel - 3 columns */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 lg:z-0
              w-80 lg:w-auto lg:col-span-3
              bg-white
              transform transition-transform duration-300 lg:transform-none
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              lg:rounded-2xl lg:border lg:border-slate-200
              shadow-xl lg:shadow-sm
              lg:overflow-y-auto
            `}
          >
            <div className="p-5 h-full lg:h-auto overflow-y-auto lg:overflow-visible">
              {/* Mobile close button */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Filters
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                />
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {search && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                      "{search}"
                      <button
                        onClick={() => setSearch("")}
                        className="hover:bg-indigo-100 rounded p-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                      ${minPrice || "0"} - ${maxPrice || "Any"}
                      <button
                        onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                        className="hover:bg-indigo-100 rounded p-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {inStock && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                      {inStock === "true" ? "In Stock" : "Out of Stock"}
                      <button
                        onClick={() => setInStock("")}
                        className="hover:bg-indigo-100 rounded p-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedCategories.map((catId) => {
                    const cat = categoriesData?.find((c) => c.id === catId);
                    return cat ? (
                      <span key={catId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                        {cat.name}
                        <button
                          onClick={() => handleCategoryToggle(catId)}
                          className="hover:bg-indigo-100 rounded p-0.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ) : null;
                  })}
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="my-4 border-t border-slate-100" />

              {/* Filter Grid */}
              <div className="space-y-4">
                {/* Price Range */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full pl-6 pr-2 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                      />
                    </div>
                    <span className="text-slate-300">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full pl-6 pr-2 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability & Sort Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Availability
                    </label>
                    <select
                      value={inStock}
                      onChange={(e) => setInStock(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white cursor-pointer transition-all"
                    >
                      {STOCK_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Sort By
                    </label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white cursor-pointer transition-all"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Order
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setSortMethod("desc")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        sortMethod === "desc"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      High to Low
                    </button>
                    <button
                      onClick={() => setSortMethod("asc")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        sortMethod === "asc"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Low to High
                    </button>
                  </div>
                </div>

                {/* Categories as Tags */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categoriesData?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategories.includes(category.id)
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid - 9 columns */}
          <main className="lg:col-span-9 flex flex-col min-h-0">
            {/* Results header - fixed at top */}
            <div className="shrink-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Products</h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {productsData ? (
                      <>
                        <span className="font-medium text-slate-700">
                          {(page - 1) * pageSize + 1}
                        </span>
                        {" - "}
                        <span className="font-medium text-slate-700">
                          {Math.min(page * pageSize, productsData.pagination.total)}
                        </span>
                        {" of "}
                        <span className="font-medium text-slate-700">
                          {productsData.pagination.total}
                        </span>
                        {" products"}
                      </>
                    ) : isLoading ? (
                      "Loading..."
                    ) : (
                      "Browse our products"
                    )}
                  </p>
                </div>
                
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 hidden sm:inline">Show</span>
                  <select
                    value={pageSize.toString()}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-slate-500 hidden sm:inline">per page</span>
                </div>
              </div>
            </div>

            {/* Product list container - scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              {/* Loading state */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/50"
                  >
                    <div className="aspect-square animate-shimmer" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-slate-100 rounded-lg animate-shimmer w-3/4" />
                      <div className="h-6 bg-slate-100 rounded-lg animate-shimmer w-1/2" />
                      <div className="h-4 bg-slate-100 rounded-lg animate-shimmer w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800">
                  Failed to load products
                </h3>
                <p className="text-red-600 mt-1">Please try again later.</p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && productsData?.data.length === 0 && (
              <div className="bg-white border border-slate-200/50 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  No products found
                </h3>
                <p className="text-slate-500 mt-1">
                  Try adjusting your search or filters
                </p>
                <Button
                  onClick={handleClearFilters}
                  variant="secondary"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Products */}
            {!isLoading &&
              !error &&
              productsData &&
              productsData.data.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {productsData.data.map((product) => (
                    <Link
                      to={`/product/${product.id}`}
                      key={product.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/50 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                    >
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        {/* Stock badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`
                              px-2.5 py-1 rounded-full text-xs font-medium
                              ${
                                product.inStock
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xl font-bold text-indigo-600 mt-1">
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(product.rating)
                                    ? "text-amber-400"
                                    : "text-slate-200"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination footer - fixed at bottom */}
            {productsData && productsData.data.length > 0 && (
              <div className="shrink-0 pt-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-center">
                  {/* Page navigation */}
                  <div className="flex items-center gap-1">
                    {/* First page button */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={page <= 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="First page"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Previous page"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = productsData.pagination.totalPages;
                        const currentPage = productsData.pagination.page;
                        const pages: (number | string)[] = [];

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          if (currentPage > 3) pages.push("...");
                          for (
                            let i = Math.max(2, currentPage - 1);
                            i <= Math.min(totalPages - 1, currentPage + 1);
                            i++
                          ) {
                            pages.push(i);
                          }
                          if (currentPage < totalPages - 2) pages.push("...");
                          pages.push(totalPages);
                        }

                        return pages.map((p, idx) =>
                          typeof p === "number" ? (
                            <button
                              key={idx}
                              onClick={() => handlePageChange(p)}
                              className={`
                                w-9 h-9 rounded-lg text-sm font-medium transition-all
                                ${
                                  p === currentPage
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100"
                                }
                              `}
                            >
                              {p}
                            </button>
                          ) : (
                            <span
                              key={idx}
                              className="w-9 h-9 flex items-center justify-center text-slate-400"
                            >
                              ...
                            </span>
                          )
                        );
                      })()}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= productsData.pagination.totalPages}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Next page"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Last page button */}
                    <button
                      onClick={() =>
                        handlePageChange(productsData.pagination.totalPages)
                      }
                      disabled={page >= productsData.pagination.totalPages}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Last page"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        </div>
      </div>
    </div>
  );
};
