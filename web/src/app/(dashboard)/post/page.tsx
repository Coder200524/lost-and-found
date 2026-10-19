import { getCurrentUser } from '@/lib/auth';
import { createItemAction } from '@/actions/items';
import { redirect } from 'next/navigation';

export default async function PostItemPage() {
  const user = await getCurrentUser();

  // Route protection
  if (!user) {
    redirect('/login?callbackUrl=/post');
  }

  async function handleFormSubmit(formData: FormData) {
    'use server';
    const res = await createItemAction(formData);
    if (res.success) {
      redirect('/browse');
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-6 sm:p-8 shadow-xl border border-pink-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-100">
          <span className="text-3xl">📝</span>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Report Lost or Found Item
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit campus incident via Next.js Server Actions with automatic cache revalidation
            </p>
          </div>
        </div>

        <form action={handleFormSubmit} className="flex flex-col gap-4">
          {/* Type selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Report Type</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-pink-200 bg-rose-50/60 cursor-pointer hover:bg-rose-100 transition font-bold text-xs text-rose-700">
                <input type="radio" name="type" value="LOST" defaultChecked className="accent-rose-500" />
                <span>🔴 I Lost Something</span>
              </label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 cursor-pointer hover:bg-emerald-100 transition font-bold text-xs text-emerald-700">
                <input type="radio" name="type" value="FOUND" className="accent-emerald-500" />
                <span>🟢 I Found Something</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Item Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Blue Titan Leather Wallet or Casio Calculator"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                name="category"
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="Electronics">Electronics (AirPods, Laptops, Phones)</option>
                <option value="ID & Cards">ID & Cards (College ID, Metro)</option>
                <option value="Books & Stationery">Books & Stationery (Calculators, Books)</option>
                <option value="Accessories">Accessories (Bottles, Bags)</option>
                <option value="Keys">Keys (Locker, Bike keys)</option>
                <option value="Clothing">Clothing (Jackets, Hoodies)</option>
                <option value="Other">Other Items</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Campus Location *</label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Room 402, Library 3rd Floor, Canteen"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Date & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date Occurred</label>
              <input
                type="date"
                name="dateOccurred"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Photo Image URL (Optional)</label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Provide distinctive features, brand, color, stickers, scratches, or contents inside..."
              className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Reward */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Reward Offered (Optional)</label>
            <input
              type="text"
              name="reward"
              placeholder="e.g. ₹500 Reward or Canteen Treat"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Contact Details */}
          <div className="p-3.5 rounded-xl bg-pink-50/60 border border-pink-100 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Contact Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                name="contactName"
                defaultValue={user.name}
                required
                placeholder="Name"
                className="text-xs px-3 py-2 rounded-lg bg-white border border-pink-200"
              />
              <input
                type="email"
                name="contactEmail"
                defaultValue={user.email}
                required
                placeholder="Email"
                className="text-xs px-3 py-2 rounded-lg bg-white border border-pink-200"
              />
              <input
                type="tel"
                name="contactPhone"
                defaultValue={user.phone || ''}
                placeholder="Phone (Optional)"
                className="text-xs px-3 py-2 rounded-lg bg-white border border-pink-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-full bg-[#e8848f] hover:bg-[#d86f7b] text-white font-bold text-xs shadow-md transition"
          >
            Submit Report to Campus Portal
          </button>
        </form>
      </div>
    </div>
  );
}
