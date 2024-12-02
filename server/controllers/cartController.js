import { CartDao } from '../dao/cartDao.js';
import Stripe from 'stripe';

const cartDao = new CartDao();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const cartController = {
  async getCart(req, res) {
    try {
      const cartItems = await cartDao.getCartItems(req.session.user.id);
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      res.render('cart/index', {
        title: 'Shopping Cart',
        cartItems,
        total,
        user: req.session.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { error: 'Failed to load cart' });
    }
  },

  async addToCart(req, res) {
    try {
      const { variantId, quantity } = req.body;
      await cartDao.addToCart(req.session.user.id, variantId, quantity);
      res.redirect('/cart');
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { error: 'Failed to add item to cart' });
    }
  },

  async createCheckoutSession(req, res) {
    try {
      const cartItems = await cartDao.getCartItems(req.session.user.id);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [item.image_url]
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        })),
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
};