import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { sanitizeCart } from "../utils/sanitize_data.js";

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

export const addToCart = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [{ product: productId, price: product.price }],
      });
    } else {
      //urun sepette varsa quantity arttir
      const productIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId);

      if (productIndex > -1) {
        const cartItem = cart.cartItems[productIndex];
        cartItem.quantity += 1;

        cart.cartItems[productIndex] = cartItem;
      } else {
        cart.cartItems.push({ product: productId, price: product.price });
      }
    }

    calcTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Product added to cart successfully",
      num_of_cart_items: cart.cartItems.length,
      cart,
    });
  } catch (error) {
    console.log("Error in addToCart: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      status: "success",
      message: "All items removed from cart successfully",
    });
  } catch (error) {
    console.log("Error in removeAllFromCart: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCartByUser = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(sanitizeCart(cart));
  } catch (error) {
    console.log("Error in getCartByUser: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeSpesificCartItem = async (req, res) => {
  try {
    // Önce cart'ı bul ve item'ın var olup olmadığını kontrol et
    const existingCart = await Cart.findOne({
      user: req.user._id,
      "cartItems._id": req.params.itemId, // item ID'si cart içinde var mı?
    });

    if (!existingCart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found or item doesn't exist in cart",
      });
    }

    // Item sayısını tut (değişimi kontrol etmek için)
    const oldItemsCount = existingCart.cartItems.length;

    // Item'ı kaldır
    const updatedCart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $pull: { cartItems: { _id: req.params.itemId } },
      },
      { new: true }
    );

    // Eğer item sayısı değişmediyse, item bulunamadı demektir
    if (oldItemsCount === updatedCart.cartItems.length) {
      return res.status(404).json({
        status: "fail",
        message: "Item could not be removed from cart",
      });
    }

    // Toplam fiyatı güncelle
    calcTotalCartPrice(updatedCart);
    await updatedCart.save();

    res.status(200).json({
      status: "success",
      message: "Item removed successfully",
      num_of_cart_items: updatedCart.cartItems.length,
      cart: updatedCart,
    });
  } catch (error) {
    console.log("Error in removeSpesificCartItem: ", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  const { quantity } = req.body;

  try {
    //ilk carti buluyoruz
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    //cartItems arrayinin icinden degistirmek istedigimiz productin idsini buluyurouz
    const index = cart.cartItems.findIndex((item) => item._id.toString() === req.params.itemId);

    if (index < 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    //arrayin hangi elemanindaysa o eleamnin quantitysini gelen yeni quantity ile guncelliyoruz
    cart.cartItems[index].quantity = quantity;

    calcTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
      status: "success",
      num_of_cart_items: cart.cartItems.length,
      cart,
    });
  } catch (error) {
    console.log("Error in updateCartItemQuantity: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
