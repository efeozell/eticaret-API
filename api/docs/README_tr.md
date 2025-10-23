# 🛍️ E-Ticaret Backend API 🚀

**Node.js** kullanılarak geliştirilmiş, kullanıcı kimlik doğrulama, rol tabanlı erişim, ürün yönetimi ve nakit/Stripe ödeme entegrasyonlu sipariş işleme gibi özellikleri destekleyen tam fonksiyonel bir E-Ticaret backend API'sı.

![App Screenshot](https://github.com/efeozell/eticaret-API/blob/main/api/docs/endpoint1.png)
![App Screenshot](https://github.com/efeozell/eticaret-API/blob/main/api/docs/endpoint2.png)
![App Screenshot](https://github.com/efeozell/eticaret-API/blob/main/api/docs/stripe.png)

## ✨ Özellikler

- 🚦**Arcjet ile rate limiting ve bot taramasi**

  - Eger projeyi test etmek isterseniz arcjet.js dosyasina girip LIVE kismini DRY_RUN olarak degistirin

- 🔐 **Kullanıcı Kimlik Doğrulama & Yetkilendirme**:

  - JWT tabanlı kimlik doğrulama
  - Doğrulama kodu ile e-posta onayı
  - Rol tabanlı erişim kontrolü (Admin, Customer)

- 🛍️ **Ürün & Kategori Gezintisi**:

  - Kimlik doğrulama gerektirmeden ürün ve kategorileri görüntüleme
  - Alt kategori desteği

- 🛒 **Alışveriş Sepeti**:

  - Kayıtlı kullanıcılar için ürün sepete ekleme

- 📦 **Sipariş Yönetimi**:

  - Sipariş oluşturma ve yönetme
  - İndirim kuponu desteği

- 💳 **Ödeme Entegrasyonu**:

  - Nakit ödeme
  - Kart ödemeleri için Stripe entegrasyonu

- 👑 **Admin Özellikleri**:

  - Kullanıcı, ürün, kategori ve sipariş yönetimi
  - Ürün görselleri yükleme ve yönetme

- 🔎 **Arama & Filtreleme**:

  - Gelişmiş arama fonksiyonelliği
  - Filtreleme, sıralama, sayfalama ve alan sınırlama

- 🔐 **Güvenlik**:

  - Veri doğrulama
  - Kötüye kullanımı önlemek için rate limiting
  - HTTP Parametre Kirliliği (HPP) koruması
  - XSS ve NoSQL enjeksiyonuna karşı veri sanitizasyonu

- ⚡ **Performans Optimizasyonu**:
  - Sıkıştırma desteği
  - Cross-origin istekler için CORS etkin

## 🛠️ Kurulum

1. **Repoyu klonlayın**:
   ```bash
   git clone https://github.com/efeozell/eticaret-API
   ```
2. **Projenin Ana dizine gidin**:
   ```bash
   cd nodejs-ecommerce-api
   ```
3. **Gereksinimleri yükleyin**:
   ```bash
   npm install
   ```
4. **.env dosyasını doldurun**:

   ```bash
   PORT=5000
   MONGO_URI=your_mongo_uri

   UPSTASH_REDIS_URL=your_redis_url

   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Sunucuyu baslat**:
   ```bash
   npm start
   ```

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LİSANS dosyasına bakın.

```

```
