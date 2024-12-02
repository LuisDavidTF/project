import { pool } from '../config/database.js';

export class ProductDao {
  async findAll(category = null) {
    let query = `
      SELECT p.*, pi.image_url, c.name as category_name, u.username as seller_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
    `;
    
    if (category) {
      query += ' WHERE c.name = ?';
      const [rows] = await pool.execute(query, [category]);
      return rows;
    }
    
    const [rows] = await pool.execute(query);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, 
        GROUP_CONCAT(DISTINCT pi.image_url) as images,
        c.name as category_name,
        u.username as seller_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
      GROUP BY p.id`,
      [id]
    );
    return rows[0];
  }

  async create(productData, sellerId) {
    const { name, description, price, stock, category_id } = productData;
    console.log('Datos para la creación del producto:', {
      name,
      description,
      price,
      category_id
    });
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, stock, category_id, seller_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category_id, sellerId]
    );
    return result.insertId;
  }
  async addImage({ product_id, image_url, is_primary = 0 }) {
    console.log('Adding image:', { product_id, image_url, is_primary });
    try {
      const [result] = await pool.execute(
        'INSERT INTO product_images (product_id, image_url, is_primary)VALUES (?, ?, ?)', 
        [product_id, image_url, is_primary]);
      return result.insertId; // Retorna el ID de la imagen insertada
    } catch (error) {
      console.error('Error inserting image:', error);
      throw error;
    }
  }
  
  
}