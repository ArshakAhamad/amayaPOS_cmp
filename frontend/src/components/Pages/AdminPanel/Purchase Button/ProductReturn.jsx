import { useEffect, useState } from "react";
import axios from "axios";

const ProductReturn = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/product-returns")
      .then((response) => {
        console.log("API Response:", response.data);

        // Ensure `products` is an array
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data.products && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else {
          setProducts([]); // Set an empty array to prevent errors
          console.error("Unexpected API response format:", response.data);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product returns:", error);
        setError("Failed to load product returns.");
        setProducts([]); // Ensure `products` is always an array
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading product returns...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Product Returns</h2>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.product_name} - Quantity: {product.quantity} - Cost: ${product.totalCost}
            </li>
          ))}
        </ul>
      ) : (
        <p>No product returns found.</p>
      )}
    </div>
  );
};

export default ProductReturn;
