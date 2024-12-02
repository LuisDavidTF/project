import { pool } from '../config/database.js';

export class CartDao {
  async getCartItems(userId) {
    const [rows] = await pool.execute(`
      SELECT ci.*, p.name, p.price, pv.size, pv.color, pi.image_url
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE ci.user_id = ?
    `, [userId]);
    return rows;
  }

  async addToCart(userId, variantId, quantity) {
    await pool.execute('CALL sp_add_to_cart(?, ?, ?)', [userId, variantId, quantity]);
  }

  async updateQuantity(cartItemId, quantity) {
    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );
  }

  async removeItem(cartItemId) {
    await pool.execute('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
  }
}