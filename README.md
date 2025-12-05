# 📦 SmartSend AI

Bu proje, Google Gemini API kullanarak paketlerin boyutlarını ve ağırlığını tahmin eden, ardından kargo fiyatlarını hesaplayan yapay zeka destekli bir web uygulamasıdır.

## 🚀 Otomatik Yayınlama Rehberi (GitHub Pages)

Bu proje, kodları GitHub'a gönderdiğiniz anda otomatik olarak çalışan bir sisteme (GitHub Actions) sahiptir. Uygulamayı canlıya almak için aşağıdaki adımları izleyin.

### 1. Kodları GitHub'a Gönderin
Projeyi kendi GitHub hesabınıza yüklemek için terminalde şu komutları çalıştırın:

```bash
git add .
git commit -m "Uygulama yayina hazir"
git push origin main
```

*(Eğer henüz bir repo oluşturmadıysanız, önce [yeni bir repo](https://github.com/new) oluşturun ve bu projeyi oraya bağlayın.)*

### 2. API Anahtarını Tanımlayın (Çok Önemli!)
Uygulamanın çalışması için Google Gemini API anahtarına ihtiyacı vardır.

1. GitHub'da projenizin sayfasına gidin.
2. Üst menüden **Settings** (Ayarlar) sekmesine tıklayın.
3. Sol menüden **Secrets and variables** > **Actions** seçeneğine tıklayın.
4. **New repository secret** butonuna basın.
5. **Name** kısmına: `API_KEY` yazın.
6. **Secret** kısmına: Google AI Studio'dan aldığın anahtarı yapıştırın.
7. **Add secret** butonuna basarak kaydedin.

### 3. Sonucu Görün
API anahtarını ekledikten sonra, sistem otomatik olarak projeyi derleyip yayınlayacaktır.
İşlemin durumunu **Actions** sekmesinden takip edebilirsiniz.

İşlem başarıyla bittiğinde (yeşil tik olduğunda), sitenizin linkini görmek için:
**Settings > Pages** menüsüne gidin. En üstte "Your site is live at..." mesajı ve linkiniz görünecektir.

---
*Not: Bu uygulama Vite kullanılarak derlenir ve statik bir site olarak sunulur.*