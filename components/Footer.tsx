export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold">Adinkra Drive</h3>
            <p className="mt-3 text-sm text-gray-400 max-w-sm">
              Premium car rentals and vehicle sales in Ghana. Experience comfort,
              reliability, and style on every journey.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <p>📍 Accra, Ghana</p>

              <a
                href="tel:+233544239772"
                className="block hover:text-yellow-400"
              >
                📞 +233 (0)544239772
              </a>

              <a
                href="mailto:info@adinkradrive.com"
                className="block hover:text-yellow-400"
              >
                📧 info@adinkradrive.com
              </a>

              <a
                href="https://wa.me/233544239972"
                target="_blank"
                className="block hover:text-green-400"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-lg font-semibold">Our Location</h4>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <iframe
                src="https://www.google.com/maps?q=Accra%20Ghana&output=embed"
                width="100%"
                height="200"
                loading="lazy"
                className="border-0"
              />
            </div>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-10 flex items-center justify-center gap-6 text-gray-400">
          <a href="#" className="hover:text-white transition">Instagram</a>
          <a href="#" className="hover:text-white transition">Facebook</a>
          <a href="#" className="hover:text-white transition">LinkedIn</a>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-sm text-gray-400">
          © 2026 Adinkra Drive. All rights reserved.
        </div>
      </div>
    </footer>
  );
}