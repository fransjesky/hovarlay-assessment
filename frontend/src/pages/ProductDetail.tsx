import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { ProductResponse } from "../types";
import { Button } from "../components";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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
    // Preserve search state when going back
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-info">
            <div className="skeleton-title" />
            <div className="skeleton-price" />
            <div className="skeleton-description" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="product-detail-container">
        <div className="error-state">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleBack} variant="primary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const product = productData.data;

  return (
    <div className="product-detail-container">
      <Button onClick={handleBack} variant="secondary" className="back-button">
        &larr; Back to Results
      </Button>

      <div className="product-detail">
        <div className="product-images">
          {product.images.length > 0 ? (
            <div className="image-gallery">
              <img
                src={product.images[0].url}
                alt={product.name}
                className="main-image"
              />
              {product.images.length > 1 && (
                <div className="thumbnail-list">
                  {product.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt={product.name}
                      className="thumbnail"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="no-image-large">No Image Available</div>
          )}
        </div>

        <div className="product-details-info">
          <h1>{product.name}</h1>
          
          <p className="product-price-large">${product.price.toFixed(2)}</p>
          
          <div className="product-rating-large">
            <span className="rating-stars">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="rating-value">{product.rating.toFixed(1)} / 5</span>
          </div>

          <span
            className={`stock-badge-large ${product.inStock ? "in-stock" : "out-of-stock"}`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.categories.length > 0 && (
            <div className="product-categories">
              <h3>Categories</h3>
              <div className="category-tags">
                {product.categories.map((category) => (
                  <span key={category.id} className="category-tag">
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
