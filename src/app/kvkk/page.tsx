import type { Metadata } from "next";
import Link from "next/link";
import { ADDRESS, CONTACT_EMAIL, DB_REGION, LEGAL_UPDATED, RESPONSIBLE } from "@/lib/site";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function KvkkPage() {
  return (
    <div className="px-4 pt-10">
    <article lang="tr" className="paper prose-paper mx-auto max-w-3xl p-7 text-[15px] motion-safe:animate-fade-up sm:p-12">
      <h1 className="font-serif text-4xl font-semibold text-ink [font-variation-settings:'SOFT'_100]">KVKK Aydınlatma Metni</h1>
      <p className="mt-3 text-xs text-ink-soft">
        Güncelleme: {LEGAL_UPDATED} · Almanca sürüm: <Link href="/datenschutz">Datenschutzerklärung</Link>
      </p>

      <p className="mt-6">
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi uyarınca, BookBoxD
        uygulamasını kullanan kişileri kişisel verilerinin işlenmesi hakkında bilgilendirmek amacıyla hazırlanmıştır.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        {RESPONSIBLE}
        <br />
        {ADDRESS}
        <br />
        E-posta: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li>
          <strong>Kimlik ve iletişim:</strong> kullanıcı adı, e-posta adresi
        </li>
        <li>
          <strong>Hesap güvenliği:</strong> şifre (yalnızca bcrypt ile özetlenmiş hâli saklanır), oturum çerezi
        </li>
        <li>
          <strong>Profil (isteğe bağlı):</strong> kısa tanıtım yazısı, profil fotoğrafı (konum gibi meta veriler
          silinerek saklanır)
        </li>
        <li>
          <strong>Kullanım verileri:</strong> kitaplık ve okuma listeleri, okuma ilerlemesi, puanlar ve incelemeler
        </li>
        <li>
          <strong>İşlem güvenliği:</strong> sayfa ziyareti sırasında teknik olarak oluşan bağlantı verileri (ör. IP
          adresi)
        </li>
      </ul>

      <h2>3. İşleme Amaçları</h2>
      <p>
        Kişisel verileriniz; üyelik hesabının oluşturulması ve yönetilmesi, kişisel kitaplık ve topluluk
        özelliklerinin sunulması ile uygulamanın güvenli şekilde işletilmesi amaçlarıyla işlenir.
      </p>

      <h2>4. Hukuki Sebepler ve Toplama Yöntemi</h2>
      <p>
        Verileriniz, kayıt ve kullanım sırasında elektronik ortamda doğrudan sizin tarafınızdan sağlanarak toplanır ve
        KVKK md. 5/2-c (bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması) ile md. 5/2-f (veri
        sorumlusunun meşru menfaati) hukuki sebeplerine dayanılarak işlenir.
      </p>

      <h2>5. Aktarım</h2>
      <p>
        Veriler, veritabanı hizmet sağlayıcısı Supabase’in {DB_REGION} bölgesindeki sunucularında saklanır; bu
        nedenle KVKK md. 9 kapsamında yurt dışına aktarım söz konusudur. Kitap arama için kullanılan Open Library
        servisine yalnızca arama terimleri iletilir, kişisel veri aktarılmaz. Verileriniz reklam veya pazarlama
        amacıyla üçüncü kişilerle paylaşılmaz.
      </p>

      <h2>6. Saklama Süresi</h2>
      <p>
        Verileriniz hesabınız açık olduğu sürece saklanır. Hesabınızı{" "}
        <Link href="/settings">Ayarlar → Hesabı sil</Link> üzerinden dilediğiniz zaman silebilirsiniz; bu durumda
        tüm verileriniz derhal ve kalıcı olarak silinir.
      </p>

      <h2>7. İlgili Kişinin Hakları (KVKK md. 11)</h2>
      <p>Veri sorumlusuna başvurarak;</p>
      <ul>
        <li>kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,</li>
        <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>eksik veya yanlış işlenmişse düzeltilmesini, KVKK md. 7 şartları çerçevesinde silinmesini isteme,</li>
        <li>bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>münhasıran otomatik sistemlerle analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme,</li>
        <li>kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
      </ul>
      <p>
        haklarına sahipsiniz. Başvurularınızı <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> adresine
        iletebilirsiniz.
      </p>
    </article>
    </div>
  );
}
