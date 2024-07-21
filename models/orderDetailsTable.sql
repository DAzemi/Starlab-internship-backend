CREATE TABLE order_details (
    order_detail_id int AUTO_INCREMENT PRIMARY KEY,
    order_id varchar(255) NOT NULL,
    user_id int NOT NULL,
    product_id int NOT NULL,
    quantity int NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(orderId),
    FOREIGN KEY (user_id) REFERENCES users(userId),
    FOREIGN KEY (product_id) REFERENCES products(productId)
);