CREATE TABLE user_favorites (
  favoriteId INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  FOREIGN KEY (user_id) REFERENCES users(userId),
  FOREIGN KEY (product_id) REFERENCES products(productId) 
);