import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { sanitizeCart } from "../utils/sanitize_data.js";

const calcTotalCartPrice = (cart) => {
  if (!cart.cartItems || !Array.isArray(cart.cartItems)) {
    cart.totalCartPrice = 0;
    cart.totalPriceAfterDiscount = undefined;
    return 0;
  }
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

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    // Önce ürünü bul ve kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    // Stok kontrolü
    if (!product.quantity || product.quantity < 1) {
      return res.status(400).json({
        status: "fail",
        message: "Product is out of stock",
        currentStock: product.quantity,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      // İlk kez sepete ekleme
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [
          {
            product: productId,
            price: product.price,
            quantity: 1, // Başlangıç miktarı
          },
        ],
      });
    } else {
      // Ürün sepette var mı kontrol et
      const productIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId);

      if (productIndex > -1) {
        // Ürün sepette varsa miktar kontrolü
        const cartItem = cart.cartItems[productIndex];

        if (product.quantity < cartItem.quantity + 1) {
          return res.status(400).json({
            status: "fail",
            message: `Only ${product.quantity} items available in stock`,
          });
        }
        cartItem.quantity += 1;
        cart.cartItems[productIndex] = cartItem;
      } else {
        // Yeni ürün ekleme
        cart.cartItems.push({
          product: productId,
          price: product.price,
          quantity: 1, // Yeni ürün için başlangıç miktarı
        });
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

    res.status(200).json(cart);
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

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a valid quantity (minimum 1)",
    });
  }

  try {
    // Kullanicinin cartini buluyor
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    // Cartin icindeki cartItems icinden guncellenecek olan item i itemin idsi ile buluyurouz
    const index = cart.cartItems.findIndex((item) => item._id.toString() === req.params.itemId);
    if (index < 0) {
      return res.status(404).json({
        status: "fail",
        message: "Cart item not found",
      });
    }

    // Buldugumuz urunun idsini kullanarak Product semasindan buluyoruz
    const product = await Product.findById(cart.cartItems[index].product);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product no longer exists",
      });
    }

    // detayli stok kontrolu
    if (!product.quantity || product.quantity < 1) {
      return res.status(400).json({
        status: "fail",
        message: "Product is out of stock",
        currentStock: product.quantity,
      });
    }

    //eger urunun quantity'si istek olarak gelen quantity'den kucukse stokda yoktur hata dondur
    if (product.quantity < quantity) {
      return res.status(400).json({
        status: "fail",
        message: `Cannot update quantity. Only ${product.quantity} items available in stock`,
        requestedQuantity: quantity,
        availableStock: product.quantity,
      });
    }

    // quantityi ilgili carttaki cartItemsin icindeki urunun quantitysi ile guncelliyoruz
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
