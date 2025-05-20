// script.js
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get("customerId"); // Müşteri ID'sini URL'den al
  const modelId = urlParams.get("model");
  const kiyafetId = urlParams.get("kiyafet");

  // Müşteri ID'si olmadan uygulama çalışamaz
  if (!customerId) {
    console.error(
      "iframe: customerId parametresi eksik! Uygulama başlatılamıyor."
    );
    showErrorState(
      "Gerekli müşteri bilgisi eksik. Lütfen URL'yi kontrol edin."
    );
    // Opsiyonel: Uygulamanın geri kalanını yüklemeyi durdurabilirsiniz.
    document.body.innerHTML =
      '<p style="color: red; padding: 20px;">Hata: Gerekli müşteri bilgisi eksik.</p>';
    return;
  }

  // TODO: Supabase kullanarak customerId'nin geçerli olup olmadığını kontrol et (opsiyonel ama önerilir)
  // isValidCustomer(customerId).then(isValid => { if (!isValid) { showError...; return; }})

  console.log(
    `iframe: Müşteri=[${customerId}], Model=[${modelId}], Kıyafet=[${kiyafetId}] için başlatılıyor.`
  );

  if (modelId && kiyafetId) {
    // Gerekli görselleri yükle ve denemeyi başlat
    // Bu fonksiyon artık customerId'yi de dikkate almalı
    initializeTryOnFromParams(customerId, modelId, kiyafetId);
  } else {
    console.error(
      `iframe [${customerId}]: Model ve/veya kıyafet parametreleri eksik!`
    );
    showErrorState("Model veya kıyafet bilgisi eksik.");
  }
});

async function initializeTryOnFromParams(custId, model, clothing) {
  console.log(
    `iframe [${custId}]: Deneme başlatılıyor - Model: ${model}, Kıyafet: ${clothing}`
  );
  try {
    // TODO: Supabase kullanarak custId'ye özel model ve kıyafet verilerini yükle
    // Örnek:
    // const { data: modelData, error: modelError } = await supabase
    //   .from('models')
    //   .select('*')
    //   .eq('customer_id', custId)
    //   .eq('model_identifier', model) // veya model ID'si nasılsa
    //   .single();
    //
    // const { data: clothingData, error: clothingError } = await supabase
    //   .from('clothes')
    //   .select('*')
    //   .eq('customer_id', custId)
    //   .eq('clothing_identifier', clothing) // veya kıyafet ID'si nasılsa
    //   .single();
    //
    // if (modelError || clothingError) throw new Error('Veri yüklenemedi');
    // if (!modelData || !clothingData) throw new Error('Model veya kıyafet bulunamadı');

    // Şu anlık varsayılan verilerle devam edelim veya hata fırlatalım
    console.log(
      `iframe [${custId}]: (Placeholder) Model ve kıyafet verileri yüklendi varsayılıyor.`
    );

    // Arayüzü kur ve denemeyi göster
    setupUI(model, clothing); // Bu fonksiyonlar belki custId'ye özel ayar alabilir
    startTryOnProcess(model, clothing); // Bu fonksiyonlar belki custId'ye özel ayar alabilir
  } catch (error) {
    console.error(
      `iframe [${custId}]: Veri yükleme veya başlatma hatası:`,
      error
    );
    showErrorState(`Veriler yüklenemedi: ${error.message}`);
  }
}

// Sonucu ana pencereye gönderirken customerId'yi de kullanabiliriz (örn. origin belirlemek için)
async function sendResultToParentWindow(customerId, resultImageUrl) {
  let targetOrigin = "*"; // Varsayılan, güvensiz.

  // TODO: Supabase kullanarak customerId için izin verilen origin'i al
  // try {
  //   const { data: customerConfig, error } = await supabase
  //     .from('customers')
  //     .select('allowed_origins')
  //     .eq('customer_id', customerId)
  //     .single();
  //   if (customerConfig && customerConfig.allowed_origins && customerConfig.allowed_origins.length > 0) {
  //      targetOrigin = customerConfig.allowed_origins[0]; // Veya daha karmaşık bir mantık
  //      console.log(`iframe [${customerId}]: İzin verilen origin bulundu: ${targetOrigin}`);
  //   } else {
  //      console.warn(`iframe [${customerId}]: İzin verilen origin bulunamadı, '*' kullanılacak.`);
  //   }
  // } catch (error) {
  //    console.error(`iframe [${customerId}]: Origin bilgisi alınırken hata:`, error);
  // }

  if (window.parent && window.parent !== window) {
    console.log(
      `iframe [${customerId}]: Sonuç (${resultImageUrl.substring(
        0,
        30
      )}...) şuraya gönderiliyor: ${targetOrigin}`
    );
    window.parent.postMessage(
      {
        type: "virtualTryonResult", // Mesaj tipini belirtmek standarttır
        customerId: customerId, // Müşteri tarafı ihtiyaç duyarsa diye
        imageUrl: resultImageUrl,
      },
      targetOrigin
    ); // Güvenlik! Sadece beklenen domaine gönder.
  } else {
    console.warn(
      `iframe [${customerId}]: Ana pencere yok, sonuç gönderilemedi.`
    );
  }
}

function showErrorState(message) {
  // Kullanıcıya hata mesajı gösterme kodunuzu buraya ekleyin
  // Örneğin, HTML içinde belirli bir div'in içeriğini ayarlayabilirsiniz.
  console.error("HATA Gösteriliyor:", message);
  const errorContainer = document.getElementById("error-container"); // HTML'de bu ID'li bir element olmalı
  if (errorContainer) {
    errorContainer.textContent = `Bir sorun oluştu: ${message}`;
    errorContainer.style.display = "block"; // Görünür yap
  } else {
    // Fallback: Eğer özel bir hata alanı yoksa body'ye ekle veya alert göster
    document.body.innerHTML = `<p style="color: red; padding: 20px;">Hata: ${message}</p>`;
  }
}

// ----- Sizin Mevcut Fonksiyonlarınız (Varsayılan) -----
// Bu fonksiyonların gerçek implementasyonları sizde olacaktır.
// Belki bazıları Supabase'den alınan verilere göre davranır.

function setupUI(model, clothing) {
  console.log(`iframe: Arayüz ${model} ve ${clothing} ile kuruluyor.`);
  // Modeli göster, kıyafet alanını hazırla vb.
  // Örn: document.getElementById('model-display').src = ...;
}

function startTryOnProcess(model, clothing) {
  console.log(
    `iframe: Sanal deneme işlemi ${model} ve ${clothing} ile başlatılıyor.`
  );
  // Asıl sanal deneme mantığınız burada çalışır
  // ... işlem ...
  // Sonuç hazır olduğunda:
  // const finalImageUrl = generateFinalResultImage(model, clothing); // Bu sizin fonksiyonunuz
  // const currentCustomerId = new URLSearchParams(window.location.search).get('customerId'); // Tekrar al veya sakla
  // sendResultToParentWindow(currentCustomerId, finalImageUrl);
  console.log(`iframe: (Placeholder) Sanal deneme tamamlandı varsayılıyor.`);
  // Test için örnek bir sonuç gönderelim 2 saniye sonra:
  setTimeout(() => {
    const currentCustomerId = new URLSearchParams(window.location.search).get(
      "customerId"
    );
    const placeholderImageUrl =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 şeffaf piksel
    if (currentCustomerId) {
      // Eğer hala customerId varsa
      sendResultToParentWindow(currentCustomerId, placeholderImageUrl);
    }
  }, 2000);
}

// function generateFinalResultImage(model, clothing) {
//    // ... sizin görsel oluşturma mantığınız ...
//    // return "data:image/png;base64,..." veya "https://.../result.png";
// }

// ----- Supabase Client Kurulumu (Gerçek Anahtarlarla Yapılacak) -----
// import { createClient } from '@supabase/supabase-js' // Eğer modül kullanıyorsanız

// const SUPABASE_URL = 'HENUZ_BILINMIYOR'; // Buraya sizin Supabase URL'niz gelecek
// const SUPABASE_ANON_KEY = 'HENUZ_BILINMIYOR'; // Buraya sizin Supabase Anon Key'iniz gelecek

// let supabase = null;
// try {
//    // supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//    console.log("Supabase client (placeholder) oluşturuldu.");
// } catch (e) {
//    console.error("Supabase client oluşturulamadı!", e);
//    showErrorState("Uygulama yapılandırması yüklenemedi.");
// }

// ------------------------------------------------------------------
