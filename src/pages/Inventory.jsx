import { useEffect, useState } from "react";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [conflictId, setConflictId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "kilogram",
    category: "OTHERS",
  });

  const fetchInventory = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);
  }, []);

  const getAvailable = (i) => i.quantity - i.reserved_quantity;

  const filtered = items.filter((i) => {
    if (filter !== "ALL" && i.category !== filter) return false;
    if (search && !i.item_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = items.reduce((a, b) => a + b.quantity, 0);
  const reserved = items.reduce((a, b) => a + b.reserved_quantity, 0);

  const handleUpdateQuantity = async (id, newQuantity) => {
    const finalQuantity = Math.max(0, Number(newQuantity));

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item,
      ),
    );

    try {
      await API.patch(`/inventory/${id}`, {
        quantity: finalQuantity,
      });
      fetchInventory(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Update failed";
      
      // Trigger visual feedback
      setConflictId(id);
      setTimeout(() => setConflictId(null), 3000);
      
      // If it's a reservation error, specifically alert the user
      if (err?.response?.status === 400) {
        alert(msg);
      }
      
      fetchInventory(false);
    }
    setEditingId(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.item_name || !newItem.quantity || !newItem.unit) {
      setFormError("Please add the details to initiate");
      return;
    }

    setFormError("");
    setAdding(true);

    try {
      await API.post("/inventory/", {
        ...newItem,
        quantity: parseFloat(newItem.quantity),
      });

      setShowForm(false);
      fetchInventory(false);
      setNewItem({
        item_name: "",
        quantity: "",
        unit: "kilogram",
        category: "OTHERS",
      });
    } catch {
      setFormError("Failed to add item. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await API.delete(`/inventory/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchInventory(false);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Failed to delete item. Please try again.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Units" value={total} />
            <StatCard label="Reserved" value={reserved} />
            <StatCard label="Available" value={total - reserved} highlight />
          </>
        )}
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-5 py-2 rounded-lg w-full sm:w-auto"
        >
          + Add Item
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search inventory..."
        className="w-full max-w-md px-4 py-3 rounded-lg bg-surface_high"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "FOOD", "MEDICAL", "WATER", "OTHERS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f ? "bg-primary text-white" : "bg-surface_high"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="bg-surface_high rounded-xl overflow-hidden border border-black/5">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-3 text-xs font-semibold text-on_surface_variant border-b border-black/10">
          <div>Name</div>
          <div>Category</div>
          <div>Total</div>
          <div>Reserved</div>
          <div>Available</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : (
          <>
            {filtered.map((i) => {
              const available = getAvailable(i);
              const low = available < i.quantity * 0.2;

              return (
                <div
                  key={i.id}
                  className="flex flex-col md:grid md:grid-cols-6 gap-4 px-4 py-5 md:py-3 md:items-center border-b border-black/5 hover:bg-black/5 transition relative"
                >
                  {/* Row 1: Item Name + Actions (Mobile Friendly) */}
                  <div className="flex justify-between items-start md:block">
                    <div className="font-semibold text-base md:text-sm">
                      {i.item_name}
                      {low && (
                        <span className="ml-2 text-xs text-red-500">⚠</span>
                      )}
                    </div>
                    {/* Actions moved here for mobile, but hidden for md+ (classic placement) */}
                    <div className="flex md:hidden gap-2">
                       <button
                          onClick={() => {
                            setEditingId(i.id);
                            setEditValue(i.quantity);
                          }}
                          className="p-1.5 bg-primary/10 text-primary rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(i)}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="md:block">
                    <span className="text-[10px] md:text-xs bg-surface px-2 py-1 rounded-full uppercase tracking-wider font-bold opacity-80">
                      {i.category}
                    </span>
                  </div>

                  {/* Quantities (3-column grid on mobile) */}
                  <div className="grid grid-cols-3 md:contents gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t border-black/5 md:border-0 text-center md:text-left">
                    {/* TOTAL */}
                    <div>
                      <div className="md:hidden text-[10px] uppercase font-bold opacity-40 mb-1">Total</div>
                      {editingId === i.id ? (
                        <input
                          autoFocus
                          type="number"
                          className="w-full md:w-20 px-2 py-1 bg-surface_highest rounded outline-none border border-primary/30 text-sm"
                          value={editValue}
                          onBlur={() => handleUpdateQuantity(i.id, editValue)}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleUpdateQuantity(i.id, editValue);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className="text-sm md:text-base">{i.quantity}</span>
                      )}
                    </div>

                    {/* RESERVED */}
                    <div>
                      <div className="md:hidden text-[10px] uppercase font-bold opacity-40 mb-1">Reserved</div>
                      <div className={`transition-all duration-300 rounded px-2 py-1 inline-block ${conflictId === i.id ? "animate-pulse-red text-red-500 font-bold scale-110" : "text-sm md:text-base"}`}>
                        {i.reserved_quantity}
                      </div>
                    </div>

                    {/* AVAILABLE */}
                    <div>
                      <div className="md:hidden text-[10px] uppercase font-bold opacity-40 mb-1">Available</div>
                      <div className={`text-sm md:text-base ${low ? "text-red-500 font-bold" : ""}`}>
                        {available}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Actions (Hidden on mobile) */}
                  <div className="hidden md:flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingId(i.id);
                        setEditValue(i.quantity);
                      }}
                      className="p-1 hover:bg-primary/10 rounded"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(i)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-on_surface_variant">
                No items found
              </div>
            )}
          </>
        )}
      </div>

      {/* --- ADD ITEM MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative w-full max-w-md bg-surface p-6 rounded-xl shadow-soft animate-fadeIn">
            <h2 className="text-xl font-bold mb-6">Add New Item</h2>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice, Bandages..."
                  className="w-full px-4 py-2 rounded-lg bg-surface_high"
                  value={newItem.item_name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, item_name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-70">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-lg bg-surface_high"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-70">
                    Unit
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-lg bg-surface_high"
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                  >
                    <option value="kilogram">Kilogram (kg)</option>
                    <option value="litre">Litre (L)</option>
                    <option value="piece">Piece (pcs)</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">
                  Category
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["FOOD", "MEDICAL", "WATER", "OTHERS"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewItem({ ...newItem, category: cat })}
                      className={`px-3 py-1 rounded-full text-xs transition ${
                        newItem.category === cat
                          ? "bg-primary text-white"
                          : "bg-surface_high hover:bg-surface_highest"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-red-500 text-xs font-medium">{formError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-surface_high font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm bg-surface p-6 rounded-xl shadow-soft animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">delete</span>
            </div>

            <h2 className="text-lg font-bold mb-1">Delete Item?</h2>
            <p className="text-sm text-on_surface_variant mb-6">
              Are you sure you want to delete <b>{deleteTarget.item_name}</b>?
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 mb-4 rounded bg-red-50 text-red-600 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-surface_high font-semibold transition hover:bg-surface_highest"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT QUANTITY (INLINE OVERLAY) --- */}
      {editingId && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setEditingId(null)}
        >
          {/* This is a backdrop to close edit on click outside if we want, or just handle it in the row */}
        </div>
      )}
    </div>
  );
};

/* ---------------- SKELETONS ---------------- */

const StatCardSkeleton = () => (
  <div className="p-5 rounded-xl bg-surface_high">
    <Skeleton className="h-3 w-20 mb-2" variant="text" />
    <Skeleton className="h-6 w-16" />
  </div>
);

const SkeletonRows = () => (
  <>
    {[...Array(6)].map((_, idx) => (
      <div
        key={idx}
        className="flex flex-col md:grid md:grid-cols-6 gap-4 px-4 py-5 md:py-3 md:items-center border-b border-black/5"
      >
        <div className="flex justify-between items-center md:block">
            <Skeleton className="h-4 w-24" variant="text" />
            <div className="md:hidden flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
        </div>
        <Skeleton className="h-3 w-16" variant="text" />
        <div className="grid grid-cols-3 md:contents gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-black/5">
            <Skeleton className="h-4 w-10 mx-auto md:mx-0" variant="text" />
            <Skeleton className="h-4 w-10 mx-auto md:mx-0" variant="text" />
            <Skeleton className="h-4 w-10 mx-auto md:mx-0" variant="text" />
        </div>
        <div className="hidden md:flex justify-end">
          <Skeleton className="h-4 w-12" variant="text" />
        </div>
      </div>
    ))}
  </>
);

/* ---------------- ORIGINAL ---------------- */

const StatCard = ({ label, value, highlight }) => (
  <div
    className={`p-5 rounded-xl ${
      highlight ? "bg-primary text-white" : "bg-surface_high"
    }`}
  >
    <p className="text-xs">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Inventory;
