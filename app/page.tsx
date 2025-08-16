// app/page.tsx (Server Component — no "use client")
import { Mail } from "lucide-react"
import ClientOnly from "./components/ClientOnly"
import ProductCarousel from "./components/ProductCarousel"

const products = [
  {
    id: 1,
    name: "Personalized Wooden Keychain",
    price: "£12.00",
    images: ["/images/keychain-front.jpg", "/images/keychain-back.jpg"],
    description: "Engraved solid wood keychain with your initials or logo.",
  },
  {
    id: 2,
    name: "Custom Engraved Flask",
    price: "£25.00",
    images: ["/images/flask-front.jpg", "/images/flask-back.jpg"],
    description: "Stainless steel flask engraved with your design.",
  },
  {
    id: 3,
    name: "Engraved Metal Plaque",
    price: "£40.00",
    images: ["/images/plaque-front.jpg", "/images/plaque-back.jpg"],
    description: "Durable metal plaque with laser-etched precision text.",
  },
]

export default function LaserEngravingCatalog() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Laser-Engraved Catalog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unique, personalized, and built to last. Browse our curated collection of laser-engraved items.
        </p>
      </section>

      <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-6 md:px-12 pb-20 flex-1">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
            {/* Client-only carousel to avoid hydration issues */}
            <ClientOnly>
              <ProductCarousel images={product.images} />
            </ClientOnly>

            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{product.description}</p>
              <p className="text-gray-900 font-bold mt-2">{product.price}</p>
              <div className="mt-auto pt-4">
                <a
                  href="mailto:orders@irinel-engraving.example?subject=Order%20Inquiry"
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact to Order
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>

      <footer className="bg-gray-800 text-gray-200 py-8 text-center text-sm">
        <p>&copy; 2025 Irinel Engraving. All rights reserved.</p>
        <p className="mt-2">Crafted with ❤️ in the UK</p>
      </footer>
    </main>
  )
}
