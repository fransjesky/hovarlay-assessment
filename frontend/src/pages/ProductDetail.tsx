import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { ProductResponse } from "../types";
import { Button, Header } from "../components";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      return apiClient<ProductResponse>(`/api/products/${id}`);
    },
    enabled: !!id,
  });

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
        <Header />

        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-full">
            <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden h-full">
              <div className="grid md:grid-cols-2 gap-0 h-full">
                {/* Image skeleton */}
                <div className="aspect-square md:aspect-auto animate-shimmer" />

                {/* Info skeleton */}
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-slate-100 rounded-lg animate-shimmer w-3/4" />
                  <div className="h-6 bg-slate-100 rounded-lg animate-shimmer w-1/3" />
                  <div className="h-5 bg-slate-100 rounded-lg animate-shimmer w-1/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-lg animate-shimmer" />
                    <div className="h-4 bg-slate-100 rounded-lg animate-shimmer" />
                    <div className="h-4 bg-slate-100 rounded-lg animate-shimmer w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="h-screen overflow-hidden bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-slate-200/50 p-8 text-center max-w-md mx-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
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
          <h2 className="text-lg font-bold text-slate-800">Product not found</h2>
          <p className="text-slate-500 mt-1 text-sm">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} variant="primary" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const product = productData.data;
  const selectedImage = product.images[selectedImageIndex]?.url;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      <Header />

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-full flex flex-col">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4 shrink-0">
            <Link
              to="/"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Products
            </Link>
            <svg
              className="w-4 h-4 text-slate-400"
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
            <span className="text-slate-800 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* Product card */}
          <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden shadow-sm max-h-[calc(100%-3rem)]">
            <div className="grid md:grid-cols-2 gap-0 h-full">
              {/* Images section */}
              <div className="bg-slate-50 p-4 flex flex-col h-full overflow-hidden">
                {/* Main image */}
                <div className="flex-1 min-h-0 bg-white rounded-lg overflow-hidden shadow-sm mb-3">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="w-full h-full object-contain"
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
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-1 px-1 shrink-0 -mx-1">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`
                          flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all
                          ${
                            index === selectedImageIndex
                              ? "ring-2 ring-indigo-500 ring-offset-2"
                              : "opacity-60 hover:opacity-100"
                          }
                        `}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details section */}
              <div className="p-4 md:p-5 flex flex-col overflow-y-auto">
                {/* Categories */}
                {product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
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
                  <span className="text-sm text-slate-600">
                    {product.rating.toFixed(1)} out of 5
                  </span>
                </div>

                {/* Price & Stock row */}
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${product.price.toFixed(2)}
                  </span>
                  <span
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${
                        product.inStock
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {product.inStock ? (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        In Stock
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
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
                        Out of Stock
                      </>
                    )}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-4 flex-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Back button */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleBack}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
